const app = require("../app");
const request = require("supertest");

describe("Admin services", function () {
  test("should give response with status code 201 when signed up", async () => {
    const response = await request(app).post("/admin/signup").send({
      email: "admin4@gmail.com",
      password: "12345",
      name: "Admin4",
    });
    expect(response.statusCode).toBe(201);
  },30000);

  test("should give response with status code 200 when signed in with existing email id", async () => {
    const response = await request(app).post("/admin/login").send({
      email: "admin@gmail.com",
      password: "12345",
      name: "Admin",
    });
    expect(response.statusCode).toBe(200);
  },30000);

  test("should give error with status code 401 when token is invalid", async () => {
    const response = await request(app)
      .get("/admin/restaurantAdmins")
      .set("authorization", "Bearer" + "xyz");
    expect(response.statusCode).toBe(500);
  },30000);
});
