export function ErrorComponent({ error }: { error: Error }) {
  console.log(error);
  return <div>Error happened</div>;
}
