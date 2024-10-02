import React, { useRef, useState } from "react";
import axios, { AxiosError } from "axios";
import { loadCheckoutWebComponents } from "@checkout.com/checkout-web-components";

const billing = {
  address: {
    country: "GB",
  },
};

const App: React.FC = () => {
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState<string>("GBP");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const flowContainerRef = useRef<HTMLDivElement | null>(null);

  const getPaymentInfo = async (id: string) => {
    try {
      const paymentDetails = await axios.get(
        `http://localhost:5000/api/paymentDetails/${id}`
      );
      return paymentDetails;
    } catch (error) {
      console.log(error);
    }
  };

  const handlePayment = async () => {
    setPaymentSuccess(false);
    try {
      const paymentResponse = await axios.post(
        "http://localhost:5000/api/create-payment",
        {
          amount: parseInt(amount) * 100, // Convert to pence/ cents/ whatever
          currency,
          billing,
        }
      );
      console.log("Payment session:", paymentResponse.data);
      const paymentSession = paymentResponse.data;
      const publicKey = import.meta.env.VITE_PUBLIC_API_KEY;
      const checkout = await loadCheckoutWebComponents({
        paymentSession,
        publicKey,
        environment: "sandbox",
        onPaymentCompleted: async (_self, payment) => {
          const paymentDetails = await getPaymentInfo(payment.id);
          console.log("Payment details", paymentDetails?.data);
          _self.unmount();
          setPaymentSuccess(true);
        },
        onError(_self, error) {
          console.log("woops", error);
        },
      });

      const flowComp = checkout.create("flow");
      if (flowContainerRef.current) flowComp.mount(flowContainerRef.current);
    } catch (error) {
      console.error(
        "Session error:",
        (error as AxiosError).response?.data || (error as AxiosError).message
      );
    }
  };

  return (
    <div
      style={{
        justifyContent: "center",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h1 style={{ textAlign: "center" }}>Checkout.com Flow Payment</h1>

      <div
        style={{
          justifyContent: "center",
          width: "100%",
          flexDirection: "row",
          display: "flex",
        }}
      >
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
        </select>
        <button onClick={handlePayment}>Pay</button>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        {paymentSuccess ? (
          <img
            style={{ width: "100%", maxWidth: "400px" }}
            src="/scrooge_mcDuck.jpg"
          />
        ) : (
          <div
            id="flow-container"
            ref={flowContainerRef}
            style={{ width: "100%", maxWidth: "400px" }}
          />
        )}
      </div>
    </div>
  );
};

export default App;
