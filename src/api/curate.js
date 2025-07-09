export async function fetchCuratedContent(topic, classLevel) {
  const response = await fetch("https://eimgsif6fm.ap-south-1.awsapprunner.com/curate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      topic,
      class_level: classLevel
    })
  });

  if (!response.ok) throw new Error("API Error");

  return response.json();
}
