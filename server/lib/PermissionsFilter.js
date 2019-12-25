const squel = require('squel');
const logFile = require('debug')('model:file');
const ROLE = 'ROLE';
const USER = 'USER';
const ALLOW = 'ALLOW';

function to(promise) {return promise.then(data => {return [null, data];}).catch(err => [err]);}
async function exeQuery(sql, app) {return await to(new Promise(function (resolve, reject) {let ds = app.dataSources['msql'];ds.connector.execute(sql, [], function (err, res) {if (err) reject(res);else resolve(res);});}));}

module.exports = class PermissionsFilter {

    constructor(req, app, userId, fileModel) {
        this.request = req;
        this.app = app;
        this.pRecords = [];
        this.userId = userId;
        this.fileModel = fileModel;
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
        
        logFile("Permissions.Filter.filterByPermissions is launched");

        if (!this.userId) {
            //extract access token and find out user id
            let userId = this.request.accessToken && this.request.accessToken.userId;
            if (!userId) { logFile("no user id (user is logged out), aborting..."); return false; }
            this.userId = userId;
        }

        const filePath = this.request.path ? this.request.path.split('/') : this.request.params[0].split('/');
        const fileName = filePath[filePath.length - 1];

        let fileId = fileName.split('.')[0]; //principalId
        const model = this.fileModel;

        const rmRole = await this.app.models.RoleMapping.findOne({
            where: { principalId: this.userId },
            fields: { roleId: true },
            include: 'role'
        });
        
        if (!(rmRole && rmRole.role && rmRole.role.name)) { logFile("no user role found, aborting..."); return false; }

        let userRole=null;
        try{
            userRole = JSON.parse(JSON.stringify(rmRole)).role.name;
        }catch(err){
            logFile("Could not parse rmRole into object, userRole, err",userRole,err);
            return false;

        }

        let query = squel
            .select({ separator: "\n" })
            .field("*")
            .from('records_permissions')
            .where("model=?", model)
            .where(
                squel.expr()
                    .and("principalId=?", null)
                    .or("principalId=?", this.userId)
                    .or("principalId=?", userRole)
            )
            .where(
                squel.expr().and("recordId=?", null).or("recordId=?", fileId)
            );

        logFile("\nSQL Query", query.toString());
        logFile("\n");

        let [err, pRecords] = await exeQuery(query.toString(), this.app);
        if (err) { logFile("exeQuery err", err); return false; }
        if (!pRecords) { logFile("no precords, aborting..."); return false; }

        this.pRecords = pRecords;

        let allow = true;

        let record = this.findByKeys({ principalType: ROLE, principalId: userRole })
        if (record && record.permission != ALLOW) allow = false;

        record = this.findByKeys({ principalType: USER, principalId: this.userId })
        if ((record && record.permission == ALLOW) || (allow && !record)) allow = true;
        else allow = false;

        return allow;
    }
}
