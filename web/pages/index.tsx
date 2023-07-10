import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import AuthLayout from "../components/shared/layout/authLayout";
import BasePageV2 from "../components/shared/layout/basePageV2";
import { useOrg } from "../components/shared/layout/organizationContext";
import LoadingAnimation from "../components/shared/loadingAnimation";
import MetaData from "../components/shared/metaData";
import HomePage from "../components/templates/home/homePage";
import { DEMO_EMAIL } from "../lib/constants";

interface HomeProps {}

const Home = (props: HomeProps) => {
  const {} = props;
  const router = useRouter();

  const user = useUser();
  const orgContext = useOrg();

  if (orgContext?.currentOrg?.has_onboarded === false && user !== null) {
    router.push("/welcome");
    return <LoadingAnimation title="Redirecting you to onboarding..." />;
  }

  if (user && user.email !== DEMO_EMAIL) {
    router.push("/dashboard");
    return <LoadingAnimation title="Redirecting you to your dashboard..." />;
  }

  return (
    <MetaData title="Home">
      <HomePage />
    </MetaData>
  );
};

export default Home;
