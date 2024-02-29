import { User } from "@supabase/auth-helpers-react";
import { GetServerSidePropsContext } from "next";
import AuthLayout from "../components/layout/authLayout";
import RequestsPageV2 from "../components/templates/requestsV2/requestsPageV2";
import { SupabaseServerWrapper } from "../lib/wrappers/supabase";
import { SortDirection } from "../services/lib/sorts/requests/sorts";
import { ReactElement, useEffect } from "react";

// Got this ugly hack from https://stackoverflow.com/questions/21926083/failed-to-execute-removechild-on-node
const jsToRun = `
if (typeof Node === 'function' && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function(child) {
    if (child.parentNode !== this) {
      if (console) {
        console.error('Cannot remove a child from a different parent', child, this);
      }
      return child;
    }
    return originalRemoveChild.apply(this, arguments);
  }

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function(newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (console) {
        console.error('Cannot insert before a reference node from a different parent', referenceNode, this);
      }
      return newNode;
    }
    return originalInsertBefore.apply(this, arguments);
  }
}
`;

interface RequestsV2Props {
  user: User;
  currentPage: number;
  pageSize: number;
  sort: {
    sortKey: string | null;
    sortDirection: SortDirection | null;
    isCustomProperty: boolean;
  };
  initialRequestId: string | null;
}

const RequestsV2 = (props: RequestsV2Props) => {
  const { user, currentPage, pageSize, sort, initialRequestId } = props;

  useEffect(() => {
    var observer = new MutationObserver(function (event) {
      if (document.documentElement.className.match("translated")) {
        eval(jsToRun);
      } else {
        console.log("Page untranslate");
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
      childList: false,
      characterData: false,
    });
  }, []);

  return (
    <RequestsPageV2
      currentPage={currentPage}
      pageSize={pageSize}
      sort={sort}
      initialRequestId={
        initialRequestId === null ? undefined : initialRequestId
      }
    />
  );
};

RequestsV2.getLayout = function getLayout(page: ReactElement) {
  return <AuthLayout>{page}</AuthLayout>;
};

export default RequestsV2;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const supabase = new SupabaseServerWrapper(context).getClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };

  const {
    page,
    page_size,
    sortKey,
    sortDirection,
    isCustomProperty,
    requestId,
  } = context.query;

  const currentPage = parseInt(page as string, 10) || 1;
  const pageSize = parseInt(page_size as string, 10) || 25;

  return {
    props: {
      user: user,
      currentPage,
      pageSize,
      sort: {
        sortKey: sortKey ? (sortKey as string) : null,
        sortDirection: sortDirection ? (sortDirection as SortDirection) : null,
        isCustomProperty: isCustomProperty === "true",
      },
      initialRequestId: requestId ? (requestId as string) : null,
    },
  };
};
