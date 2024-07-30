import { Link } from "react-router-dom";
import TextInput from "../components/text-input";
import "../styles/css/form.css";

function Signup() {
  return (
    <form className="form">
      <h1>Create account</h1>
      <TextInput name="username" label="Username"></TextInput>
      <TextInput name="password" label="Password" password={true}></TextInput>
      <TextInput
        name="confirmpassword"
        label="Confirm Password"
        password={true}
      ></TextInput>
      <button type="submit" className="btn-submit">
        Create account
      </button>

      <p>
        Already have an account? <Link to={"/signin"}>Sign-in</Link>
      </p>
    </form>
  );
}

export default Signup;
