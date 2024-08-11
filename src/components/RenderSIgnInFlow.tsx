import React, { createContext, useContext, useCallback, useState } from "react";
import {
  Box,
  TextInput,
  Button,
  Rows,
  Columns,
  Column,
} from "@canva/app-ui-kit";
import {
  requestOTP,
  validateOTP,
  startAuthenticationFlow,
} from "src/components/AuthUtils";
import { AuthContextType, useAuth } from "./useContext";
// Replace with your actual auth service
export type AuthState =
  | "checking"
  | "authenticated"
  | "not_authenticated"
  | "error";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const renderAuthStep = (
  setError,
  step,
  setStep,
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>,
  isLoading: boolean,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  // handleAuthStatus
) => {
  const { email, setEmail, otp, setOtp } = useAuth();

  return step === "email" ? (
    <Rows spacing="2u">
      <TextInput
        type="text"
        value={email}
        onChange={(e) => setEmail(e)}
        placeholder="Enter your email"
        disabled={isLoading}
      />

      <Box paddingTop="1u">
        <Button
          variant="primary"
          loading={isLoading}
          onClick={async () => {
            setIsLoading(true);
            setError("");
            try {
              const requestOtpResponse = await requestOTP(email);
              if (requestOtpResponse.ok) {
                setStep("otp");
              } else {
                const body = await requestOtpResponse.json();
                setError(
                  body?.message || "An error occurred while requesting OTP"
                );
              }
            } catch (err) {
              setError("An error occurred while requesting OTP");
            } finally {
              setIsLoading(false);
            }
          }}
          // disabled={isLoading}
        >
          Next
        </Button>
      </Box>
    </Rows>
  ) : step === "otp" ? (
    <Rows spacing="2u">
      <TextInput
        type="text"
        value={otp}
        defaultValue={otp}
        onChange={(e) => setOtp(e)}
        placeholder="Enter the six digit code sent to your email"
        disabled={isLoading}
      />
      <Box paddingTop="1u">
        <Columns spacing="1u">
          <Column width="content">
            <Button
              variant="secondary"
              onClick={() => {
                setStep("email");
                setAuthState("checking");
                setOtp("");
              }}
            >
              Back
            </Button>
          </Column>
          <Column width="content">
            <Button
              variant="primary"
              onClick={async () => {
                setIsLoading(true);
                setError("");
                try {
                  const verifyOtpResponse = await validateOTP(email, otp);
                  if (verifyOtpResponse.ok) {
                    startAuthenticationFlow(
                      email,
                      otp,
                      setAuthState,
                      // handleAuthStatus
                    );
                  } else {
                    const body = await verifyOtpResponse.json();
                    console.log(body);
                    setError(
                      body?.message || "An error occurred while requesting OTP"
                    );
                    setError("Invalid OTP");
                  }
                } catch (err) {
                  setError("An error occurred during authentication");
                } finally {
                  setIsLoading(false);
                }
              }}
              loading={isLoading}
              // disabled={isLoading}
            >
              Authenticate
            </Button>
          </Column>
        </Columns>
      </Box>
    </Rows>
  ) : null;
};

export default renderAuthStep;
