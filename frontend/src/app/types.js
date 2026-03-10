// Type definitions for reference (JSDoc comments)

/**
 * @typedef {'admin' | 'producer' | 'transporter' | 'store' | 'consumer'} UserRole
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {UserRole} role
 * @property {string} [phone]
 * @property {string} [address]
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {string} productionPlace
 * @property {string} productionDate
 * @property {string} expiryDate
 * @property {string} producerId
 * @property {string} producerName
 * @property {string} currentStatus
 * @property {string} qrCode
 * @property {string} [blockchainHash]
 * @property {string} createdAt
 */

/**
 * @typedef {Object} SupplyChainStep
 * @property {string} id
 * @property {string} productId
 * @property {'harvest' | 'packaging' | 'transport' | 'warehouse' | 'retail'} step
 * @property {string} stepName
 * @property {string} timestamp
 * @property {string} location
 * @property {string} performedBy
 * @property {string} performedById
 * @property {string} status
 * @property {string} [notes]
 * @property {string} [blockchainHash]
 */

/**
 * @typedef {Object} BlockchainTransaction
 * @property {string} id
 * @property {string} txHash
 * @property {'product_created' | 'supply_chain_updated' | 'status_changed'} type
 * @property {string} productId
 * @property {any} data
 * @property {string} timestamp
 */

export {};
