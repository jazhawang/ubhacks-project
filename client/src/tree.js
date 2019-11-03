import React from 'react';

import './App.css';

function Block({ value, used }) {
	const className =
		`block ${(typeof value !== 'number') && 'hidden'} ${used && 'used'}`
	return <div className={className}>{value}</div>
}

function SubArray({ array, mergeIndex }) {
	const className =
		`subarray ${array.every(v => typeof v !== 'number') && 'hidden'}`
	return (
		<div className={className}>
			{array.map((a, i) => Block({ value: a, used: mergeIndex > i }))}
		</div>
	)
}

function Node({ subarray, mergeIndex, children }) {
	return (
		<div className={`node`}>
			<div className={`node-children-row`}>
				{ children && children.map((child) => Node(child)) }
			</div>
			{ SubArray({ array: subarray, mergeIndex }) }
		</div>
	)
}

export { Node, Block }
