import { useState, useCallback, useEffect } from 'react'
import { ethers } from 'ethers'
import { DEX_ABI, TOKEN_ABI } from '../utils/abi'
import DEPLOYMENTS_RAW from '../deployments.json'

const DEPLOYMENTS = DEPLOYMENTS_RAW || {}

export function useDEX(signer, account) {
  const [dex,      setDex]      = useState(null)
  const [tokens,   setTokens]   = useState({})
  const [userInfo, setUserInfo] = useState(null)
  const [streak,   setStreak]   = useState(0)
  const [balances, setBalances] = useState({})
  const [loading,  setLoading]  = useState(false)
  const [txHash,   setTxHash]   = useState(null)

  useEffect(() => {
    if (!signer || !DEPLOYMENTS.contracts) return
    const d = new ethers.Contract(DEPLOYMENTS.contracts.DriftDEX, DEX_ABI, signer)
    setDex(d)
    const toks = {}
    for (const [sym, addr] of Object.entries(DEPLOYMENTS.contracts)) {
      if (sym !== 'DriftDEX') toks[sym] = new ethers.Contract(addr, TOKEN_ABI, signer)
    }
    setTokens(toks)
  }, [signer])

  const refreshUser = useCallback(async () => {
    if (!dex || !account) return
    try {
      const stats = await dex.userStats(account)
      const s     = await dex.currentStreak(account)
      setUserInfo({
        totalPoints: Number(stats.totalPoints),
        swapsCount:  Number(stats.swapsCount),
        registered:  stats.registered,
        referrer:    stats.referrer,
      })
      setStreak(Number(s))
    } catch {}
  }, [dex, account])

  const refreshBalances = useCallback(async () => {
    if (!account || Object.keys(tokens).length === 0) return
    const bals = {}
    for (const [sym, tok] of Object.entries(tokens)) {
      try {
        const bal = await tok.balanceOf(account)
        bals[sym] = ethers.formatEther(bal)
      } catch {}
    }
    setBalances(bals)
  }, [tokens, account])

  useEffect(() => { refreshUser(); refreshBalances() }, [refreshUser, refreshBalances])

  const register = useCallback(async (refCode) => {
    if (!dex) return
    setLoading(true)
    try {
      const code = refCode
        ? ethers.encodeBytes32String(refCode.slice(0, 31))
        : ethers.ZeroHash
      const tx = await dex.register(code)
      setTxHash(tx.hash)
      await tx.wait()
      await refreshUser()
    } catch(e) { console.error(e) }
    setLoading(false)
  }, [dex, refreshUser])

  const faucet = useCallback(async (symbol) => {
    const tok = tokens[symbol]
    if (!tok) return
    setLoading(true)
    try {
      const tx = await tok.faucet()
      setTxHash(tx.hash)
      await tx.wait()
      await refreshBalances()
    } catch(e) { console.error(e) }
    setLoading(false)
  }, [tokens, refreshBalances])

  const approveAndSwap = useCallback(async (tokenInSym, tokenOutSym, amountIn, minOut) => {
    if (!dex || !DEPLOYMENTS.contracts) return false
    setLoading(true)
    try {
      const tokenIn = tokens[tokenInSym]
      const amtIn   = ethers.parseEther(String(amountIn))
      const allow   = await tokenIn.allowance(account, DEPLOYMENTS.contracts.DriftDEX)
      if (allow < amtIn) {
        const ap = await tokenIn.approve(DEPLOYMENTS.contracts.DriftDEX, ethers.MaxUint256)
        await ap.wait()
      }
      const minOutWei = ethers.parseEther(String(Number(minOut) * 0.99))
      const tx = await dex.swap(
        DEPLOYMENTS.contracts[tokenInSym],
        DEPLOYMENTS.contracts[tokenOutSym],
        amtIn, minOutWei, account
      )
      setTxHash(tx.hash)
      await tx.wait()
      await refreshUser(); await refreshBalances()
      return true
    } catch(e) { console.error(e); return false }
    finally { setLoading(false) }
  }, [dex, tokens, account, refreshUser, refreshBalances])

  const addLiquidity = useCallback(async (symA, symB, amtA, amtB) => {
    if (!dex || !DEPLOYMENTS.contracts) return false
    setLoading(true)
    try {
      for (const [sym, amt] of [[symA, amtA], [symB, amtB]]) {
        const tok    = tokens[sym]
        const amtWei = ethers.parseEther(String(amt))
        const allow  = await tok.allowance(account, DEPLOYMENTS.contracts.DriftDEX)
        if (allow < amtWei) {
          const ap = await tok.approve(DEPLOYMENTS.contracts.DriftDEX, ethers.MaxUint256)
          await ap.wait()
        }
      }
      const tx = await dex.addLiquidity(
        DEPLOYMENTS.contracts[symA], DEPLOYMENTS.contracts[symB],
        ethers.parseEther(String(amtA)), ethers.parseEther(String(amtB)), 0, 0
      )
      setTxHash(tx.hash)
      await tx.wait()
      await refreshUser(); await refreshBalances()
      return true
    } catch(e) { console.error(e); return false }
    finally { setLoading(false) }
  }, [dex, tokens, account, refreshUser, refreshBalances])

  const getAmountOut = useCallback(async (tokenInSym, tokenOutSym, amountIn) => {
    if (!dex || !DEPLOYMENTS.contracts || !amountIn) return '0'
    try {
      const out = await dex.getAmountOut(
        DEPLOYMENTS.contracts[tokenInSym],
        DEPLOYMENTS.contracts[tokenOutSym],
        ethers.parseEther(String(amountIn))
      )
      return ethers.formatEther(out)
    } catch { return '0' }
  }, [dex])

  const getLeaderboard = useCallback(async () => {
    if (!dex) return []
    try {
      const [users, points] = await dex.getLeaderboard(20)
      return users.map((u, i) => ({ address: u, points: Number(points[i]) }))
    } catch { return [] }
  }, [dex])

  const getReferralCode = useCallback(async () => {
    if (!dex || !account) return null
    try {
      const code = await dex.userReferralCode(account)
      return code === ethers.ZeroHash ? null : code
    } catch { return null }
  }, [dex, account])

  return {
    dex, tokens, userInfo, streak, balances, loading, txHash,
    register, faucet, approveAndSwap, addLiquidity, getAmountOut,
    getLeaderboard, getReferralCode, refreshUser, deployments: DEPLOYMENTS,
  }
}
