"use strict";

class PermissionsComponent {
  managementPermissionsExists;
  contextMenusPermissionsExists;
  constructor() {
    this.managementPermissionsExists = null;
    this.contextMenusPermissionsExists = null;
  }
  hasPermission(permission) {
    return new Promise(resolve => {
      browser.permissions.contains({
        permissions: [permission]
      }).then(result => {
        resolve(result);
      });
    });
  }
  async hasManagementPermissions() {
    if (this.managementPermissionsExists === null) {
      this.managementPermissionsExists = await this.hasPermission('management');
    }
    return this.managementPermissionsExists;
  }
  async hasContextMenuPermissions() {
    if (this.contextMenusPermissionsExists === null) {
      this.contextMenusPermissionsExists = await this.hasPermission('contextMenus');
    }
    return this.contextMenusPermissionsExists;
  }
}
const permissionsComponent = new PermissionsComponent();