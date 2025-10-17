// src/page/address/AddressPage.jsx
import React from "react";
import { useMe } from "../../auth/user/useMe";
import AddressSection from "../../components/user/AddressSection";

const AddressPage = () => {
  const { me, loading } = useMe(); // me.id is your userId

  if (loading) return <div>Loading...</div>;
  if (!me) return <div>Please login to view your addresses.</div>;

  return <AddressSection userId={me.id} />; // ✅ pass userId to component
};

export default AddressPage;
