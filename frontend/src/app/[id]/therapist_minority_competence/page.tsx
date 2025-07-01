import {Button, CheckboxGroup, Flex, Heading} from "@radix-ui/themes";
import {getApplication, updateApplication} from "@/api/application";
import {redirect} from "next/navigation";
import Form from "next/form";

export default async function TherapistMinorityCompetencePage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const {id} = await params;
  const {therapist_minority_competence} = await getApplication(id);

  const handleSubmit = async (formData: FormData) => {
    "use server";

    await updateApplication(id, {
      current_page: 'review',
      therapist_minority_competence_responses: formData.getAll('therapist_minority_competence')
    })
    redirect(`/${id}/review`);
  }

  const handleChange = async (therapist_minority_competence_responses: string[]) => {
    "use server";
    await updateApplication(id, { therapist_minority_competence_responses })
  }

  return <>
      <Form action={handleSubmit}>
        <Flex direction="column" gap="3">
          <Heading>
            Do you want your therapist to have knowledge in any of these areas? (Optional)
          </Heading>
          <CheckboxGroup.Root onValueChange={handleChange} defaultValue={therapist_minority_competence} name='therapist_minority_competence'>
            <CheckboxGroup.Item value='lgbtq'>LGBTQ+</CheckboxGroup.Item>
            <CheckboxGroup.Item value='minority_stress'>Minority stress</CheckboxGroup.Item>
            <CheckboxGroup.Item value='neurodivergent'>Neurodivergent</CheckboxGroup.Item>
            <CheckboxGroup.Item value='polyamorous_relationships'>Polyamorous relationships</CheckboxGroup.Item>
            <CheckboxGroup.Item value='rbts'>Race-based traumatic stress (RBTS)</CheckboxGroup.Item>
            <CheckboxGroup.Item value='transgender_knowledge'>Transgender knowledge</CheckboxGroup.Item>
          </CheckboxGroup.Root>
          <Button type='submit'>Next</Button>
        </Flex>
      </Form>
  </>
}