import React, { useState } from 'react'
import '../../styles/logoutModal.css'
import { X } from 'lucide-react'

const LogoutModal = ({ onClose, onConfirm }) => {

  return (
    <section>
        <div className="modal-container">
            <div className="modal" 
                style={{ width: '40%', height: '40%'}}
            >
                <div className="modal-header">
                    <h2 className="modal-title">Logout</h2>
                    <div className="close-icon" onClick={() => onClose(false)}>
                        <X />
                    </div>
                    </div>
                    <div className="modal-body">
                    <p className="modal-text">Are you sure you want to logout?</p>
                    </div>
                    <div className="modal-actions">
                    <button className="modal-btn confirm" onClick={onConfirm}>
                        Yes, Logout
                    </button>
                    <button className="modal-btn cancel" onClick={() => onClose(false)}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </section>
  )
}

export default LogoutModal







// import React from 'react';
// import '../../styles/Modal.css';
// import { X } from 'lucide-react';

// const LogoutModal = ({ onClose, onConfirm }) => {
//   return (
//     <section className="modal-container">
//       <div className="modal" style={{ width: '40%', height: '40%' }}>
        
//       </div>
//     </section>
//   );
// };

// export default LogoutModal;

