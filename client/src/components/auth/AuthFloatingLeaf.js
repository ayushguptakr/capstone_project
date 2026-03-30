import React from "react";
import { EcoLogo } from "../../components/EcoLogo";

export default function AuthFloatingLeaf() {
  return (
    <div className="flex justify-center mb-6">
      <EcoLogo size="lg" animated={true} showTagline={false} withText={false} />
    </div>
  );
}
