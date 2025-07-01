export async function updateApplication(id: string, body: object) {
  "use server";

  await fetch(
    `http://localhost:3005/api/application/${id}`,
    {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
      body: JSON.stringify(body),
    }
  );
}

export async function getApplication(id: string): Promise<{
  current_page: string;
  application_submitted: boolean;
  patient_age?: string,
  patient_gender?: string,
  therapist_minority_competence: string[]
}> {
  "use server";

  const response = await fetch(`http://localhost:3005/api/application/${id}`)
  return response.json()
}

export async function getApplications(): Promise<{
  applications: Array<{
    application_id: number,
    application_submitted: boolean,
    current_page: string,
  }>;
}> {
  "use server";

  const response = await fetch(`http://localhost:3005/api/application`)
  return response.json()
}

export async function startApplication(): Promise<{ application_id: number}> {
  "use server";

  const response = await fetch(
    `http://localhost:3005/api/application`,
    {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    }
  );

  return response.json()
}