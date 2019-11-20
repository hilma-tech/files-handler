const squel = require('squel');
const { exeQuery } = require('../../../../../server/common/db/queries');
const logFile = require('debug')('model:file');
const ROLE = 'ROLE';
const USER = 'USER';
const ALLOW = 'ALLOW';

module.exports = class PermissionsFilter {

    constructor(req, app, userId) {
        this.request = req;
        this.app = app;
        this.pRecords = [];
        this.userId = userId;
    }

    findByKeys(args) {
        let isMatch = true;

        for (let pRecord of this.pRecords) {
            isMatch = true;
            Object.keys(args).forEach((argKey) => {
                let argValue = args[argKey];

                if (!pRecord[argKey] || Array.isArray(argValue) || argValue != pRecord[argKey])
                    isMatch = false;
            })

            if (isMatch) return pRecord;
        };

        return isMatch; //false
    }

    async filterByPermissions() {
        console.log("\nfilterByPermissions");

        if (!this.userId) {
            //extract access token and find out user id
            let userId = this.request.accessToken && this.request.accessToken.userId;
            if (!userId) { console.log("no user id (user is logged out), aborting..."); return; }
            this.userId = userId;
        }

        const filePath = this.request.path ? this.request.path.split('/') : this.request.params[0].split('/');
        const fileName = filePath[filePath.length - 1];

        let fileId = fileName.split('.')[0]; //principalId
        const model = filePath[1];

        const rmRole = await this.app.models.RoleMapping.findOne({
            where: { principalId: this.userId },
            fields: { roleId: true },
            include: 'role'
        });
        if (!(rmRole && rmRole.role && rmRole.role.name)) { console.log("no user role found, aborting..."); return/* false*/; }

        let userRole = rmRole.role.name;

        let query = squel
            .select({ separator: "\n" })
            .field("*")
            .from('records_permissions')
            .where("model=?", model)
            .where(
                squel.expr()
                    .and("principal_id=?", null)
                    .or("principal_id=?", this.userId)
                    .or("principal_id=?", userRole)
            )
            .where(
                squel.expr().and("record_id=?", null).or("record_id=?", fileId)
            );

        // console.log("query\n", query.toString());
        let [err, pRecords] = await exeQuery(query.toString(), this.app);
        if (err) { console.log("exeQuery err", err); return; }
        if (!pRecords) { console.log("no precords, aborting..."); return; }

        this.pRecords = pRecords;

        let allow = true;

        let record = this.findByKeys({ principal_type: ROLE, principal_id: userRole })
        if (record && record.permission != ALLOW) allow = false;

        record = this.findByKeys({ principal_type: USER, principal_id: this.userId })
        if ((record && record.permission == ALLOW) || (allow && !record)) allow = true;
        else allow = false;

        return allow;
    }
}
