import { OpenAPI } from './OpenAPI.ts';

export const downloadFileFromApi = async (
  url: string
) => {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${OpenAPI.TOKEN}`
    }
  });

  if (!response.ok) {
    let errorMessage = 'Unknown error occurred';
    try {
      const errorResponse = await response.json();
      errorMessage = errorResponse.message || JSON.stringify(errorResponse);
    } catch (jsonError) {
      errorMessage = response.statusText;
    }

    throw new Error(errorMessage);
  }

  const contentDisposition = response.headers.get('Content-Disposition');
  const filenameMatch = contentDisposition!.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
  const fileName = filenameMatch ? filenameMatch[1].replace(/['"]/g, '') : 'default-filename.csv';

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = fileName;
  link.style.display = 'none';

  // Append to the document and trigger download
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
}
