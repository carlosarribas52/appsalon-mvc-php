<h1 class="nombre-pagina">Olvi´de mi Password</h1>
<p class="descripcion-pagina">Reestablece tu password escribiendo tu email a continuación</p>

<form class="formulario" action="/olvide" method="POST">
    <div class="campo">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" placeholder="Tu Email" />
    </div>
    
    <input type="submit" class="boton" value="Enviar instrucciones">
</form>

<div class="acciones">
    <a href="/">¿Tienes una cuenta? Entra con tu login</a>
    <a href="/crear-cuenta">¿Aún no tienes una cuenta? Crear una</a>    
</div>