const authMiddleware = require("../middleware/is-auth");

describe("Customer service", function () {
  test("should throw an error if the token cannot be verified", () => {
    const req = {
      get: function (headerName) {
        return "Bearer xyz";
      },
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).toThrow();
  });

  test("should throw an error if the authorization header is only one string", () => {
    const req = {
      get: function (headerName) {
        return "xyz";
      },
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).toThrow();
  });

  test("should throw an error if no authorization header is present", () => {
    const req = {
      get: function (headerName) {
        return null;
      },
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).toThrow();
  });
});
