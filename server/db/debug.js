module.exports = function (...params) {
  if (process.env.NODE_ENV !== "test") {
    let variant = params[0];
    if (["log", "info", "warn", "error", "debug"].includes(variant)) {
      params = params.slice(1);
    } else {
      variant = "info";
    }
    console[variant](...params);
  }
};
