import Customer from "../models/Customer.js";
import User from "../models/User.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";
import sequelize from "../config/database.js";
import bcrypt from "bcryptjs";
import AuditLog from "../models/AuditLog.js";

// ✅ Módulos sin duplicados y organizados
const MODULES = [
  "users",
  "customers",
  "products",
  "invoices",
  "production",
  "recipes",
  "raw_materials",
  "promotions",
  "product_units",
  "reports",
  "units",
  "roles"
];

const initializeDatabase = async () => {
  try {
    await sequelize.sync();

    await AuditLog.sync();
    console.log("✅ Audit logs table synchronized");

    // Crear consumidor final
    const existingConsumer = await Customer.findOne({
      where: { identification_type: "final_consumer" },
    });

    if (!existingConsumer) {
      await Customer.create({
        identification_type: "final_consumer",
        identification: "9999999999999",
        name: "Final Consumer",
        active: true,
      });
      console.log("✅ Final consumer created successfully");
    } else {
      console.log("✅ Final consumer already exists");
    }

    // Crear rol Admin
    let adminRole = await Role.findOne({
      where: { name: "Admin" },
    });

    if (!adminRole) {
      adminRole = await Role.create({
        name: "Admin",
        description: "Administrador con acceso completo al sistema",
      });

      // Crear permisos completos para todos los módulos
      const permissions = MODULES.map((module) => ({
        module,
        can_view: true,
        can_create: true,
        can_edit: true,
        can_delete: true,
        role_id: adminRole.id,
      }));

      // Agregar permiso de auditoría (solo lectura)
      permissions.push({
        module: "audit",
        can_view: true,
        can_create: false,
        can_edit: false,
        can_delete: false,
        role_id: adminRole.id,
      });

      await Permission.bulkCreate(permissions);

      console.log("✅ Admin role created successfully with all permissions");
    } else {
      console.log("✅ Admin role already exists");
    }

    // Crear usuario Admin
    const existingAdmin = await User.findOne({
      where: { email: "boriscaiza04@gmail.com" },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("123456", 10);

      await User.create({
        name: "Boris Caiza",
        email: "boriscaiza04@gmail.com",
        password: hashedPassword,
        role_id: adminRole.id,
        active: true,
      });

      console.log("✅ Admin user created successfully");
      console.log("📧 Email: boriscaiza04@gmail.com");
      console.log("🔑 Password: 123456");
    } else {
      console.log("✅ Admin user already exists");
    }

    console.log("\n🎉 Database initialization completed!");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
  } finally {
    await sequelize.close();
  }
};

initializeDatabase();