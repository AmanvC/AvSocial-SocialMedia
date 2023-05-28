import { useContext, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import toast from "react-hot-toast";
import "./register.scss";

import { BiInfoCircle } from "react-icons/bi";

import validator from "validator";

const Register = () => {
  const [inputs, setInputs] = useState({
    firstName: "",
    lastName: "",
    password: "",
    passwordAgain: "",
    email: "",
    emailAgain: "",
  });
  const [valid, setValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [passwordValid, setPasswordValid] = useState(true);
  const [loading, setLoading] = useState(false);

  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const submitForm = async (e) => {
    try {
      e.preventDefault();
      setLoading(true);
      const res = await makeRequest().post("/users/create-user", {
        ...inputs,
      });
      setLoading(false);
      navigate("/login");
      toast.success(res.data.message);
    } catch (err) {
      setLoading(false);
      toast.error(err.response.data.message);
    }
  };

  const changeInputs = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validatePassword = (e) => {
    const passwordValidity = validator.isStrongPassword(e.target.value);
    setPasswordValid(passwordValidity);
    setInputs((prev) => ({ ...prev, password: e.target.value }));
    if (e.target.value === "") {
      setPasswordValid(true);
    }
  };

  if (
    inputs.firstName &&
    inputs.lastName &&
    inputs.password &&
    inputs.email &&
    inputs.password === inputs.passwordAgain &&
    inputs.email === inputs.emailAgain
  ) {
    if (!valid) {
      setValid(true);
    }
  } else {
    if (valid) {
      setValid(false);
    }
  }

  if (currentUser) {
    return <Navigate to="/" />;
  }

  return (
    <div className="register">
      <div className="container">
        <div id="header">
          <h1>Sign Up here!</h1>
          <p>
            Already Signed Up? Click <Link to="/login">here</Link> to Login
          </p>
        </div>
        <form id="signup-form" onSubmit={submitForm}>
          <div id="input-container">
            <div className="input">
              <p>First Name</p>
              <input
                type="text"
                name="firstName"
                placeholder="Your First Name"
                onChange={changeInputs}
                value={inputs.firstName}
                required
              />
            </div>
            <div className="input">
              <p>Last Name</p>
              <input
                type="text"
                name="lastName"
                placeholder="Your Last Name"
                onChange={changeInputs}
                value={inputs.lastName}
                required
              />
            </div>
            <div className="input">
              <p>Email</p>
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                onChange={changeInputs}
                value={inputs.email}
                required
              />
            </div>
            <div className="input">
              <p>Re-enter Email</p>
              <input
                type="email"
                name="emailAgain"
                placeholder="Re-enter Your Email"
                onChange={changeInputs}
                value={inputs.emailAgain}
                required
              />
              {inputs.email !== inputs.emailAgain && (
                <span
                  style={{
                    color: "red",
                    fontSize: 14,
                    position: "absolute",
                    left: 0,
                    top: "100%",
                    opacity: 0.7,
                  }}
                >
                  {" "}
                  *Emails should match
                </span>
              )}
            </div>
            <div className="input">
              <p>
                Password&nbsp;
                <span className="password-valid-info">
                  <BiInfoCircle
                    onMouseEnter={() => setShowInfo(true)}
                    onMouseLeave={() => setShowInfo(false)}
                  />
                  {showInfo && (
                    <small>
                      Atleast 1 uppercase, 1 lowercase, 1 special symbol, 1
                      number, and minimum 8 characters long.
                    </small>
                  )}
                </span>
              </p>
              <input
                type={!showPassword ? "password" : "text"}
                name="password"
                placeholder="Set Your Password"
                onChange={validatePassword}
                value={inputs.password}
                required
              />
              {!passwordValid && (
                <span
                  style={{
                    color: "red",
                    fontSize: 14,
                    position: "absolute",
                    left: 0,
                    top: "100%",
                    opacity: 0.7,
                  }}
                >
                  {" "}
                  Password should match the criteria
                </span>
              )}
              <span
                className="show-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                Show Password
              </span>
            </div>

            <div className="input">
              <p>Re-enter Password</p>
              <input
                type={!showPassword ? "password" : "text"}
                name="passwordAgain"
                placeholder="Re-enter Your Password"
                onChange={changeInputs}
                value={inputs.passwordAgain}
                required
              />
              {inputs.password !== inputs.passwordAgain &&
                inputs.passwordAgain.length > 0 && (
                  <span
                    style={{
                      color: "red",
                      fontSize: 14,
                      position: "absolute",
                      left: 0,
                      top: "80%",
                      opacity: 0.7,
                    }}
                  >
                    {" "}
                    *Passwords should match
                  </span>
                )}
            </div>
          </div>

          <div id="button-container">
            <button id="submit" disabled={!valid || loading}>
              <span>{loading ? "Loading..." : "Signup"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
