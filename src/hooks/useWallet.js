import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'

const BSC_TESTNET_CHAIN_ID = '0x61' // 97

export function useWallet() {
  const [account,   setAccount]   = useState(null)
  const [provider,  setProvider]  = useState(null)
  const [signer,    setSigner]    = useState(null)
  const [chainId,   setChainId]   = useState(null)
  const [connecting,setConnecting]= useState(false)
  const [error,     setError]     = useState(null)

  const isCorrectNetwork = chainId === BSC_TESTNET_CHAIN_ID

  const connect = useCallback(async () => {
    if (!window.ethereum) { setError('No wallet found. Please install MetaMask.'); return }
    setConnecting(true); setError(null)
    try {
      const prov = new ethers.BrowserProvider(window.ethereum)
      await prov.send('eth_requestAccounts', [])
      const sig  = await prov.getSigner()
      const addr = await sig.getAddress()
      const net  = await prov.getNetwork()
      setProvider(prov); setSigner(sig); setAccount(addr)
      setChainId('0x' + net.chainId.toString(16))
    } catch(e) { setError(e.message) }
    setConnecting(false)
  }, [])

  const switchNetwork = useCallback(async () => {
    if (!window.ethereum) return
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BSC_TESTNET_CHAIN_ID }],
      })
    } catch(e) {
      if (e.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: BSC_TESTNET_CHAIN_ID,
            chainName: 'BNB Smart Chain Testnet',
            nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
            rpcUrls: ['https://data-seed-prebsc-1-s1.bnbchain.org:8545'],
            blockExplorerUrls: ['https://testnet.bscscan.com'],
          }],
        })
      }
    }
  }, [])

  useEffect(() => {
    if (!window.ethereum) return
    window.ethereum.on('accountsChanged', accs => {
      setAccount(accs[0] || null)
      if (!accs[0]) { setProvider(null); setSigner(null) }
    })
    window.ethereum.on('chainChanged', id => { setChainId(id); window.location.reload() })
  }, [])

  return { account, provider, signer, chainId, isCorrectNetwork, connecting, error, connect, switchNetwork }
}
