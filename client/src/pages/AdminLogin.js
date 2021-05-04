import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';

import useAuth from '../hooks/useAuth';

import '../sass/AdminLogin.scss';

const AdminLogin = (props) => {
  const auth = useAuth();

  // eslint-disable-next-line no-unused-vars
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState('');

  const handleInputChange = (e) => setEmail(e.currentTarget.value);

  const headerToSend = process.env.REACT_APP_CUSTOM_REQUEST_HEADER;

  const handleLogin = async (e) => {
    e.preventDefault();

    if (email === '') {
      setIsError(true);
      setErrorMessage("Please don't leave the field blank.");
    } else if (!email.includes('@') || !email.includes('.')) {
      setIsError(true);
      setErrorMessage('Please format the email address correctly.');
    } else {
      let isAdmin = await checkEmail(e);

      if (isAdmin === false) {
        setIsError(true);
        setErrorMessage("You don't have the correct access level.");
      } else if (isAdmin === undefined || isAdmin === null) {
        console.log('Something is wrong try again');
      } else {
        try {
          await fetch('/api/auth/signin', {
            method: 'POST',
            headers: {
              "Content-Type": "application/json",
              "x-customrequired-header": headerToSend
            },
            body: JSON.stringify({ email: email }),
          }).then((res) => {
            if (res.status === 200) {
              props.history.push('/emailsent');
            }
          });
        } catch (error) {
          console.log(error);
        }
      }
    }
  };

  async function checkEmail(e) {
    e.preventDefault();

    try {
      setIsLoading(true);
      return await fetch('/api/checkuser', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "x-customrequired-header": headerToSend
        },
        body: JSON.stringify({ email }),
      })
        .then((res) => {
          if (res.ok) {
            return res.json();
          }

          throw new Error(res.statusText);
        })
        .then((response) => {
          if (response === false) {
            setIsError(true);
            setErrorMessage('Please enter the correct email address.');

            return response;
          } else if (response.accessLevel !== 'admin') {
            setIsError(true);
            setErrorMessage(
              "You don't have the correct access level to view the dashboard."
            );
          } else {
            return response.email;
          }
        })
        .catch((err) => {
          console.log(err);
          setIsLoading(false);
        });
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }

  return auth.user ? (
    <Redirect to="/admin" />
  ) : (
    <div className="flex-container">
      <div className="adminlogin-container">
        <div className="adminlogin-headers">
          <h3>Welcome Back!</h3>
        </div>
        <form
          className="form-check-in"
          autoComplete="off"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="form-row">
            <div className="form-input-text">
              <label htmlFor="email">Enter your email address:</label>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={email.toString()}
                // aria-label="topic"
                onChange={(e) => handleInputChange(e)}
                aria-label="Email Address"
                data-test="input-email"
                autoComplete="email"
                required="required"
              />
            </div>
          </div>
        </form>

        <div className="adminlogin-warning">
          {isError ? errorMessage : null}
        </div>

        <div className="form-input-button">
          <button
            onClick={(e) => handleLogin(e)}
            className="login-button"
            data-test="login-btn"
            disabled={!email || email === ''}
          >
            LOGIN
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
