// This file is generated by the generate-abis script. Do not modify it manually.

/**
 * Generated ABI for the BN256G2 contract.
 */
export const BN256G2Abi = [
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'x1',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'x2',
        type: 'uint256',
      },
    ],
    name: 'FQ2Sqrt',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'x1',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'x2',
        type: 'uint256',
      },
    ],
    name: 'NegateFQ2Sqrt',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'message',
        type: 'bytes',
      },
      {
        internalType: 'bytes',
        name: 'dst',
        type: 'bytes',
      },
    ],
    name: 'expandMessageXMDKeccak256',
    outputs: [
      {
        internalType: 'bytes32',
        name: 'b1',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: 'b2',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: 'b3',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: 'b4',
        type: 'bytes32',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'message',
        type: 'bytes',
      },
      {
        internalType: 'bytes32',
        name: 'dst',
        type: 'bytes32',
      },
    ],
    name: 'hashToField',
    outputs: [
      {
        internalType: 'uint256',
        name: 'u0',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'u1',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'b',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
