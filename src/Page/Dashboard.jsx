import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 추가
import styles from '../css/Dashboard.module.css'; 

function Dashboard() {
  const [isServer, setIsServer] = useState(false);
  const navigate = useNavigate(); // 페이지 이동을 위한 함수

  return (
    <div className={styles['dashboard-wrapper']}>
      <div className={styles['main-card']}>
        <div className={styles['header-section']}>
          <h1>Control Panel</h1>
          <div className={styles['toggle-container']}>
            <span className={!isServer ? styles.active : ""}>Local</span>
            <label className={styles.switch}>
              <input 
                type="checkbox" 
                checked={isServer} 
                onChange={() => setIsServer(!isServer)} 
              />
              <span className={`${styles.slider} ${styles.round}`}></span>
            </label>
            <span className={isServer ? styles.active : ""}>Server</span>
          </div>
        </div>

        <div className={styles['button-grid']}>
          {/* onClick 시 navigate를 사용하여 경로 이동 */}
          <button 
            className={`${styles['menu-btn']} ${styles.api}`} 
            onClick={() => navigate('/api', { state: { isServer } })}
          >
            <div className={styles.icon}>⚡</div>
            <span>API Chatbot</span>
          </button>
          
          <button className={`${styles['menu-btn']} ${styles.normal}`} onClick={() => navigate('/normal')}>
            <div className={styles.icon}>💬</div>
            <span>Basic Chatbot</span>
          </button>

          <button className={`${styles['menu-btn']} ${styles.customize}`} onClick={() => navigate('/customize')}>
            <div className={styles.icon}>⚙️</div>
            <span>Customize</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;