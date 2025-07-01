import {redirect} from "next/navigation";
import {Button, Flex, Heading} from "@radix-ui/themes";
import {getApplications, startApplication} from "@/api/application";
import type {Metadata} from "next";

export const metadata: Metadata = {
  title: "Your applications",
  description: "Your therapy applications",
};

export default async function Home() {
  const {applications} = await getApplications();

  const handleResume = (applicationId: number, page: string) => async () => {
    "use server"
    redirect(`/${applicationId}/${page}`);
  }

  const handleStartApplication = async () => {
    "use server"
    const {application_id} = await startApplication();
    redirect(`/${application_id}/patient_age`);
  }

  return <main>
    <Flex direction="column" gap="3">
      <Heading as="h1">Your applications</Heading>
      <Flex direction="column" gap="1">
        {applications.map((application) => (
          <form key={application.application_id} action={handleResume(application.application_id, application.current_page)}>
            {application.application_submitted
              ? 'Submitted'
              : <Button>Resume</Button>
            }
          </form>
        ))}
      </Flex>
      <form action={handleStartApplication}>
        <Button>Start a new application</Button>
      </form>
    </Flex>
  </main>
}
