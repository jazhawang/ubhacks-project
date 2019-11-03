import React from 'react'

import { Block } from './tree'

import './modal.css'

function Modal({ comparing, onSelect }) {
	return (
		<div className="modal-window">
			<div className="modal-container">
				<header className="modal-title">
					Which number is smaller?
				</header>
				<div className="modal-options-row">
					{ comparing.map(v => (
						<button className="modal-option" onClick={() => onSelect(v)}>
						{ Block({ value: v }) }
						</button>
					)) }
				</div>
			</div>
		</div>
	);
}

export { Modal }
