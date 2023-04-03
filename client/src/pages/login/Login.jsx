import { useContext, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useToasts } from "react-toast-notifications";
import { AuthContext } from "../../context/authContext";
import "./login.scss";

const Login = () => {
  const [inputs, setInputs] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { currentUser, login } = useContext(AuthContext);

  const { addToast } = useToasts();

  const navigate = useNavigate();

  const submitForm = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      await login(inputs.email, inputs.password);
      navigate("/");
      setLoading(false);
      addToast("Logged in successfully.", {
        appearance: "success",
        autoDismiss: true,
      });
    } catch (err) {
      setError(err.response.data.message);
      setLoading(false);
    }
  };

  const changeInputValues = (e) => {
    setError(null);
    setInputs({
      ...inputs,
      [e.target.name]: e.target.value,
    });
  };

  if (currentUser) {
    return <Navigate to="/" />;
  }

  return (
    <div className="login">
      <div id="container">
        <div id="header">
          <h1>AvSocial</h1>
          <p>A place to connect with the world.</p>
        </div>
        <div id="form-container">
          <div id="signup-container">
            <p>
              By continuing you indicate that you agree to AvSocial's{" "}
              <Link to="">Terms of Service</Link> and{" "}
              <Link to="">Privacy Policy</Link>
            </p>
            <Link to="/auth/google">
              <div className="social-signup">
                {/* <i className="fa-brands fa-google"></i> */}
                <span>Continue with Google</span>
              </div>
            </Link>
            <a href="/auth/facebook">
              <div className="social-signup">
                {/* <i className="fa-brands fa-facebook"></i> */}
                <span>Continue with Facebook</span>
              </div>
            </a>
            <div className="local-signup">
              <Link to="/register">Register with email</Link>
            </div>
          </div>
          <div className="line"> </div>
          <div id="login-container">
            <p>
              Login
              {error && (
                <span style={{ color: "red", marginLeft: 10, fontSize: 16 }}>
                  *{error}
                </span>
              )}
            </p>
            <form onSubmit={submitForm}>
              <div className="input">
                <p>Email</p>
                <input
                  type="text"
                  name="email"
                  placeholder="Your email"
                  required
                  onChange={changeInputValues}
                  value={inputs.email}
                />
              </div>
              <div className="input">
                <p>Password</p>
                <input
                  type="password"
                  name="password"
                  placeholder="Your password"
                  required
                  onChange={changeInputValues}
                  value={inputs.password}
                />
              </div>
              <div id="actions">
                <Link to="">Forgot password?</Link>
                <button
                  id="submit"
                  disabled={loading || !inputs.email || !inputs.password}
                >
                  <span>{!loading ? "Login" : "Loading..."}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
