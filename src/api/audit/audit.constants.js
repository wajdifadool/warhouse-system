const AuditActions = {
  INVENTORY_CREATED: 'INVENTORY_CREATED',
  INVENTORY_UPDATED: 'INVENTORY_UPDATED',
  INVENTORY_TRANSFER: 'INVENTORY_TRANSFER',
}

const AuditResources = {
  INVENTORY: 'Inventory',
  PRODUCT: 'Product',
  WAREHOUSE: 'Warehouse',
  LOCATION: 'Location',
}

module.exports = {
  AuditActions,
  AuditResources,
}
