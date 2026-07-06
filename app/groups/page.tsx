import { redirect } from "next/navigation";

// El listado de grupos ahora vive en el Feed (carrusel arriba de todo),
// así que esta ruta vieja solo redirige ahí para no romper links guardados.
export default function GroupsRedirect() {
  redirect("/feed");
}
