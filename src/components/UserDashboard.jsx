import React, { useState, useEffect } from 'react'
import styles from '../styles/Dashboard.module.css'

function HexIcon({ size = 52, dim = false }) {
  const cx = size / 2, r = size * 0.46
  const pts = [0,60,120,180,240,300].map(a => {
    const rad = (a - 90) * Math.PI / 180
    return `${cx + r * Math.cos(rad)},${cx + r * Math.sin(rad)}`
  }).join(' ')
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <polygon points={pts}
        fill={dim ? 'rgba(0,255,224,0.04)' : 'rgba(0,255,224,0.07)'}
        stroke={dim ? 'rgba(0,255,224,0.18)' : '#00ffe0'}
        strokeWidth="1.2" strokeLinejoin="round"/>
      <text x={cx} y={cx} textAnchor="middle" dominantBaseline="central"
        fontFamily="Orbitron,monospace" fontSize={size * 0.38} fontWeight="900"
        fill={dim ? 'rgba(0,255,224,0.25)' : '#00ffe0'}>D</text>
    </svg>
  )
}

export default function UserDashboard({ wallet, dex }) {
  const [refCode, setRefCode] = useState(null)
  const [copied,  setCopied]  = useState(false)

  useEffect(() => {
    if (dex.userInfo?.registered) dex.getReferralCode().then(setRefCode)
  }, [dex.userInfo])

  const copyRef = () => {
    if (!refCode) return
    navigator.clipboard.writeText(`${window.location.origin}?ref=${refCode}`)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  if (!wallet.account) return (
    <div className={styles.card}>
      <div className={styles.connectPrompt}>
        <div className={styles.promptHex}><HexIcon size={52} dim /></div>
        <h3>Connect Wallet</h3>
        <p>Track your points, streaks, and leaderboard rank</p>
        <button className={styles.connectBtn} onClick={wallet.connect}>Connect</button>
      </div>
    </div>
  )

  if (!wallet.isCorrectNetwork) return (
    <div className={styles.card}>
      <div className={styles.connectPrompt}>
        <div className={styles.promptHex} style={{fontSize:36}}>⚠</div>
        <h3>Wrong Network</h3>
        <p>Switch to BNB Smart Chain Testnet to use DRIFT</p>
        <button className={styles.connectBtn} style={{background:'var(--red)'}} onClick={wallet.switchNetwork}>
          Switch Network
        </button>
      </div>
    </div>
  )

  const info = dex.userInfo
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>Your Stats</span>
        <span className={styles.addr}>{wallet.account.slice(0,6)}…{wallet.account.slice(-4)}</span>
      </div>

      {info && info.registered ? (
        <>
          <div className={styles.inner}>
            <div className={styles.pointsHero}>
              <div className={styles.pointsLabel}>DRIFT Points</div>
              <div className={styles.pointsValue}>{info.totalPoints.toLocaleString()}</div>
              <div className={styles.pointsSubtext}>
                {dex.streak >= 7 ? '🔥 2× streak multiplier active!'
                  : dex.streak > 0 ? `🔥 ${dex.streak}-day streak — keep going!`
                  : 'Swap daily for streak bonus'}
              </div>
            </div>
            <div className={styles.statGrid}>
              <div className={styles.statBox}>
                <div className={styles.statNum}>{info.swapsCount}</div>
                <div className={styles.statLbl}>Swaps</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statNum}>{dex.streak}</div>
                <div className={styles.statLbl}>Day Streak</div>
              </div>
            </div>
            <div className={styles.progressSection}>
              <div className={styles.progressLabel}>
                <span>Volume milestone</span>
                <span className="mono">{info.swapsCount} / {info.swapsCount < 50 ? 50 : 100}</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill}
                  style={{width:`${Math.min(100,(info.swapsCount/(info.swapsCount<50?50:100))*100)}%`}}/>
              </div>
              <div className={styles.progressHint}>
                {info.swapsCount < 50 ? `${50-info.swapsCount} swaps → 1.25× multiplier`
                  : info.swapsCount < 100 ? `${100-info.swapsCount} swaps → 1.5× multiplier`
                  : '✓ 1.5× multiplier active'}
              </div>
            </div>
            <div className={styles.balances}>
              <div className={styles.balHeader}>Testnet Balances</div>
              {Object.entries(dex.balances).map(([sym, bal]) => (
                <div key={sym} className={styles.balRow}>
                  <span className={styles.balSym}>{sym}</span>
                  <span className="mono" style={{fontSize:12}}>{Number(bal).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
          {refCode && (
            <div className={styles.refSection}>
              <div className={styles.refLabel}>Your Referral Link</div>
              <div className={styles.refBox}>
                <span className={styles.refCodeText}>{refCode.slice(0,20)}…</span>
                <button className={styles.copyBtn} onClick={copyRef}>{copied ? '✓ Copied' : 'Copy'}</button>
              </div>
              <div className={styles.refHint}>+200 pts per referral signup · +50 pts per their swap</div>
            </div>
          )}
        </>
      ) : (
        <div className={styles.notRegistered}>
          Register above to start earning DRIFT points and qualify for the airdrop.
        </div>
      )}
    </div>
  )
}
