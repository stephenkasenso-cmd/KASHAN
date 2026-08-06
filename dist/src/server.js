"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const PORT = process.env.PORT || 3000;
app_1.default.listen(PORT, () => {
    console.log(`🚀 Family Tree API Server listening on port ${PORT}`);
    console.log(`   Health check available at http://localhost:${PORT}/health`);
});
//# sourceMappingURL=server.js.map