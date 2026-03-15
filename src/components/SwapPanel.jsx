import React, { useState, useEffect, useCallback } from 'react'
import styles from '../styles/Panel.module.css'

const TOKENS = ['tWBNB', 'tUSDT', 'tBUSD']

export default function SwapPanel({ wallet, dex }) {
  const [tokenIn,  setTokenIn]  = useState('tWBNB')
  const [tokenOut, setTokenOut] = useState('tUSDT')
  const [amountIn, setAmountIn] = useState('')
  const [amountOut,setAmountOut]= useState('')
  const [success,  setSuccess]  = useState(false)

  const fetchOut = useCallback(async () => {
    if (!amountIn || isNaN(amountIn) || Number(amountIn) <= 0) { setAmountOut(''); return }
    const out = await dex.getAmountOut(tokenIn, tokenOut, amountIn)
    setAmountOut(Number(out).toFixed(6))
  }, [amountIn, tokenIn, tokenOut, dex])

  useEffect(() => { fetchOut() }, [fetchOut])

  const handleSwap = async () => {
    if (!amountIn || !amountOut) return
    const ok = await dex.approveAndSwap(tokenIn, tokenOut, amountIn, Number(amountOut))
    if (ok) {
      setSuccess(true); setAmountIn(''); setAmountOut('')
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  const flip = () => { setTokenIn(tokenOut); setTokenOut(tokenIn); setAmountIn(''); setAmountOut('') }
  const notConnected  = !wallet.account || !wallet.isCorrectNetwork
  const notRegistered = dex.userInfo && !dex.userInfo.registered

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>SWAP</h2>
        <span className={styles.pointsBadge}>+100 PTS per swap</span>
      </div>
      <div className={styles.tokenRow}>
        <label className={styles.label}>You pay</label>
        <div className={styles.inputRow}>
          <input className={styles.amtInput} type="number" min="0" placeholder="0.0"
            value={amountIn} onChange={e => setAmountIn(e.target.value)} />
          <select className={styles.tokenSelect} value={tokenIn} onChange={e => setTokenIn(e.target.value)}>
            {TOKENS.filter(t => t !== tokenOut).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        {dex.balances[tokenIn] && (
          <div className={styles.balance}>
            Balance: <span className="mono">{Number(dex.balances[tokenIn]).toFixed(4)}</span>
            <button className={styles.maxBtn} onClick={() => setAmountIn(dex.balances[tokenIn])}>MAX</button>
          </div>
        )}
      </div>
      <button className={styles.flipBtn} onClick={flip}>⇅</button>
      <div className={styles.tokenRow}>
        <label className={styles.label}>You receive</label>
        <div className={styles.inputRow}>
          <input className={`${styles.amtInput} ${styles.readOnly}`} type="number" placeholder="0.0"
            value={amountOut} readOnly />
          <select className={styles.tokenSelect} value={tokenOut} onChange={e => setTokenOut(e.target.value)}>
            {TOKENS.filter(t => t !== tokenIn).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      {amountIn && amountOut && (
        <div className={styles.rateRow}>
          <span className="dim">Rate</span>
          <span className="mono">1 {tokenIn} = {(Number(amountOut)/Number(amountIn)).toFixed(6)} {tokenOut}</span>
          <span className="dim" style={{fontSize:10}}>Fee: 0.30%</span>
        </div>
      )}
      {success && <div className={styles.successMsg}>Swap successful — +100 DRIFT points earned!</div>}
      <button className={styles.primaryBtn} onClick={handleSwap}
        disabled={notConnected || notRegistered || dex.loading || !amountIn || !amountOut}>
        {notConnected ? 'Connect Wallet' : notRegistered ? 'Register First' :
         dex.loading ? 'Swapping…' : 'Swap'}
      </button>
    </div>
  )
}
