import React, { useState, useEffect } from 'react'
import styles from '../styles/Header.module.css'

function HexMark({ size = 34 }) {
  const cx = size / 2, r = size * 0.47
  const pts = [0,60,120,180,240,300].map(a => {
    const rad = (a - 90) * Math.PI / 180
    return `${cx + r * Math.cos(rad)},${cx + r * Math.sin(rad)}`
  }).join(' ')
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{display:'block',flexShrink:0}}>
      <polygon points={pts} fill="rgba(0,255,224,0.07)" stroke="#00ffe0" strokeWidth="1.2" strokeLinejoin="round"/>
      <text x={cx} y={cx} textAnchor="middle" dominantBaseline="central"
        fontFamily="Orbitron,monospace" fontSize={size * 0.42} fontWeight="900" fill="#00ffe0">D</text>
    </svg>
  )
}

export default function Header({ wallet, userInfo, streak }) {
  const [scrolled, setScrolled] = useState(false)
  const [ptsBump,  setPtsBump]  = useState(false)
  const prevPts = React.useRef(0)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    if (!userInfo) return
    if (userInfo.totalPoints > prevPts.current && prevPts.current > 0) {
      setPtsBump(true); setTimeout(() => setPtsBump(false), 600)
    }
    prevPts.current = userInfo.totalPoints
  }, [userInfo?.totalPoints])

  const shortAddr = wallet.account
    ? wallet.account.slice(0,6) + '…' + wallet.account.slice(-4) : null

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        <div className={styles.logo}>
          <HexMark size={34} />
          <div className={styles.logoText}>
            <span className={styles.logoBrand}>DRIFT</span>
            <span className={styles.logoSub}>DEX</span>
          </div>
          <span className={styles.testnetBadge}>BSC TESTNET</span>
        </div>

        <nav className={styles.nav}>
          <a href="https://x.com" target="_blank" rel="noreferrer" className={styles.navLink}>Twitter/X</a>
          <a href="https://discord.gg/" target="_blank" rel="noreferrer" className={styles.navLink}>Discord</a>
          <a href="https://testnet.bscscan.com" target="_blank" rel="noreferrer" className={styles.navLink}>BscScan</a>
        </nav>

        <div className={styles.right}>
          {userInfo?.registered && (
            <div className={styles.statsRow}>
              {streak > 0 && (
                <div className={styles.streakPill}>
                  <span>🔥</span>
                  <span className={styles.streakNum}>{streak}d</span>
                </div>
              )}
              <div className={`${styles.pointsChip} ${ptsBump ? styles.ptsBump : ''}`}>
                <svg width="11" height="11" viewBox="0 0 12 12" style={{flexShrink:0}}>
                  <polygon points="6,0.5 7.5,4.5 12,4.5 8.5,7 9.8,11 6,8.5 2.2,11 3.5,7 0,4.5 4.5,4.5" fill="#00ffe0"/>
                </svg>
                <span className={styles.ptsValue}>{userInfo.totalPoints.toLocaleString()}</span>
                <span className={styles.ptsLabel}>PTS</span>
              </div>
            </div>
          )}
          {wallet.account ? (
            <div className={styles.addrChip}>
              <div className={styles.addrDot} />
              {shortAddr}
            </div>
          ) : (
            <button className={styles.connectBtn} onClick={wallet.connect} disabled={wallet.connecting}>
              {wallet.connecting ? 'Connecting…' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>
      <div className={styles.scanLine} />
    </header>
  )
}
