import {Button, Flex, Progress} from "@radix-ui/themes";
import {getApplication, updateApplication} from "@/api/application";
import {ReactNode} from "react";
import {redirect} from "next/navigation";

const PAGES = ['patient_age', 'patient_gender', 'therapist_minority_competence', 'review']

export default async function RootLayout({params, children}: Readonly<{
  params: Promise<{ id: string }>,
  children: ReactNode
}>) {
  const {id} = await params;
  const {current_page} = await getApplication(id);

  const pageNumber = PAGES.indexOf(current_page) + 1;

  const back = async () => {
    "use server";

    if (current_page === "patient_age") {
      redirect(`/`);
    } else if (current_page === "patient_gender") {
      await updateApplication(id, {current_page: 'patient_age'});
      redirect(`/${id}/patient_age`);
    } else if (current_page === "therapist_minority_competence") {
      await updateApplication(id, {current_page: 'patient_gender'});
      redirect(`/${id}/patient_gender`)
    } else if (current_page === "review") {
      await updateApplication(id, {current_page: 'therapist_minority_competence'})
      redirect(`/${id}/therapist_minority_competence`);
    } else {
      throw Error("Unrecognized page");
    }
  }

  const exit = async () => {
    "use server";
    redirect(`/`);
  }

  return (
    <Flex direction="column" gap="3">
      <nav>
        <Flex direction="column" gap="2">
          <Progress value={pageNumber} max={4}></Progress>
          <Flex justify="between">
            <form action={back}>
              <Button type="submit">Back</Button>
            </form>
            <form action={exit}>
              <Button>Save and Exit</Button>
            </form>
          </Flex>
        </Flex>
      </nav>
      <main>
        {children}
      </main>
    </Flex>
  );
}
