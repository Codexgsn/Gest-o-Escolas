"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function () { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var serverless_1 = require("@neondatabase/serverless");
var schema_1 = require("../lib/schema");
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

function main() {
    return __awaiter(this, void 0, void 0, function () {
        var pool, client, error_1, hashedPassword;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Load .env.local first
                    dotenv.config({ path: '.env.local' });
                    // Load .env as fallback
                    dotenv.config();

                    var connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
                    if (!connectionString) {
                        throw new Error('DATABASE_URL or POSTGRES_URL is not set');
                    }
                    if (connectionString.includes('postgresql://user:password')) {
                        // Fallback if DATABASE_URL is the placeholder and POSTGRES_URL was possibly missing or not loaded
                        if (process.env.POSTGRES_URL) connectionString = process.env.POSTGRES_URL;
                        else console.warn("Warning: Using placeholder DATABASE_URL which will likely fail.");
                    }
                    pool = new serverless_1.Pool({ connectionString: connectionString });
                    return [4 /*yield*/, pool.connect()];
                case 1:
                    client = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 9, 10, 12]);
                    console.log('Creating tables...');
                    return [4 /*yield*/, (0, schema_1.createUsersTable)(client)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, (0, schema_1.createResourcesTable)(client)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, (0, schema_1.createReservationsTable)(client)];
                case 5:
                    _a.sent();
                    console.log('Tables created successfully.');
                    console.log('Seeding users...');
                    // Hash password "123456"
                    return [4 /*yield*/, bcrypt.hash('123456', 10)];
                case 6:
                    hashedPassword = _a.sent();
                    return [4 /*yield*/, client.query(`
      INSERT INTO users (id, name, email, password, role)
      VALUES
        ('410544b2-4001-4271-9855-fec4b6a6442a', 'Admin User', 'admin@example.com', '${hashedPassword}', 'Admin'),
        ('3958dc9e-712f-4377-85e9-fec4b6a6442a', 'Regular User', 'user@example.com', '${hashedPassword}', 'User')
      ON CONFLICT (email) DO NOTHING;
    `)];
                case 7:
                    const userRes = _a.sent();
                    console.log('Users seeded:', userRes.rowCount);
                    console.log('Seeding resources...');
                    return [4 /*yield*/, client.query(`
      INSERT INTO resources (id, name, type, location, capacity, equipment, "imageUrl", tags)
      VALUES
        ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Sala de Reunião 1', 'Sala', 'Bloco A', 10, '{"Projetor", "Quadro Branco"}', 'https://via.placeholder.com/150', '{"reuniao", "apresentacao"}'),
        ('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Projetor Epson', 'Equipamento', 'Sala de TI', 1, '{"Cabo HDMI", "Cabo VGA"}', 'https://via.placeholder.com/150', '{"projetor", "apresentacao"}')
      ON CONFLICT (id) DO NOTHING;
    `)];
                case 8:
                    _a.sent();
                    console.log('Seeding reservations...');
                    return [4 /*yield*/, client.query(`
      INSERT INTO reservations (id, "resourceId", "userId", "startTime", "endTime")
      VALUES
        ('a56e1573-2169-4b69-8692-23c6d8d672a6', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '410544b2-4001-4271-9855-fec4b6a6442a', '2024-01-01T10:00:00Z', '2024-01-01T11:00:00Z')
      ON CONFLICT (id) DO NOTHING;
    `)];
                case 9:
                    error_1 = _a.sent();
                    console.error('Error seeding database details:');
                    if (error_1.message) console.error('Message:', error_1.message);
                    if (error_1.detail) console.error('Detail:', error_1.detail);
                    console.error('Hint:', error_1.hint);
                    console.error('Full Error:', JSON.stringify(error_1, null, 2));
                    throw error_1;
                case 10:
                    client.release();
                    return [4 /*yield*/, pool.end()];
                case 11:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 12: return [2 /*return*/];
            }
        });
    });
}
main().catch(function (err) {
    console.error('An error occurred in main:', err.message);
});
