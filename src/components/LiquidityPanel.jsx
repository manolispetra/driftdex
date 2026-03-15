import React, { useState } from 'react'
import styles from '../styles/Panel.module.css'

const TOKENS = ['tWBNB', 'tUSDT', 'tBUSD']

export default function LiquidityPanel({ wallet, dex }) {
  const [symA, setSymA] = useState('tWBNB')
  const [symB, setSymB] = useState('tUSDT')
  const [amtA, setAmtA] = useState('')
  const [amtB, setAmtB] = useState('')
  const [success, setSuccess] = useState(false)

  const notConnected  = !wallet.account || !wallet.isCorrectNetwork
  const notRegistered = dex.userInfo && !dex.userInfo.registered

  const handleAdd = async () => {
    if (!amtA || !amtB) return
    const ok = await dex.addLiquidity(symA, symB, amtA, amtB)
    if (ok) { setSuccess(true); setAmtA(''); setAmtB(''); setTimeout(() => setSuccess(false), 3000) }
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>ADD LIQUIDITY</h2>
        <span className={styles.pointsBadge}>+500 PTS per deposit</span>
      </div>
      <div className={styles.infoBox}>
        Earn 0.30% trading fees on all swaps through your pool, plus 500 DRIFT points on every deposit.
      </div>
      <div className={styles.tokenRow}>
        <label className={styles.label}>Token A</label>
        <div className={styles.inputRow}>
          <input className={styles.amtInput} type="number" min="0" placeholder="0.0"
            value={amtA} onChange={e => setAmtA(e.target.value)} />
          <select className={styles.tokenSelect} value={symA} onChange={e => setSymA(e.target.value)}>
            {TOKENS.filter(t => t !== symB).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        {dex.balances[symA] && (
          <div className={styles.balance}>Balance: <span className="mono">{Number(dex.balances[symA]).toFixed(4)}</span></div>
        )}
      </div>
      <div className={styles.plusDivider}>+</div>
      <div className={styles.tokenRow}>
        <label className={styles.label}>Token B</label>
        <div className={styles.inputRow}>
          <input className={styles.amtInput} type="number" min="0" placeholder="0.0"
            value={amtB} onChange={e => setAmtB(e.target.value)} />
          <select className={styles.tokenSelect} value={symB} onChange={e => setSymB(e.target.value)}>
            {TOKENS.filter(t => t !== symA).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        {dex.balances[symB] && (
          <div className={styles.balance}>Balance: <span className="mono">{Number(dex.balances[symB]).toFixed(4)}</span></div>
        )}
      </div>
      {success && <div className={styles.successMsg}>Liquidity added — +500 DRIFT points earned!</div>}
      <button className={styles.primaryBtn} onClick={handleAdd}
        disabled={notConnected || notRegistered || dex.loading || !amtA || !amtB}>
        {notConnected ? 'Connect Wallet' : notRegistered ? 'Register First' :
         dex.loading ? 'Processing…' : 'Add Liquidity'}
      </button>
    </div>
  )
}
