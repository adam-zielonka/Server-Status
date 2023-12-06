#[macro_use] extern crate rocket;

use rocket::response::content::RawHtml;

#[get("/")]
fn index() -> RawHtml<&'static str> {
    RawHtml("<html>
        <head>
            <title>Server Status</title>
        </head>
        <body>
            <header>
                <h1>Server Status</h1>
            </header>
            <main>
                <div>
                    ?
                </div>
                <div>
                    ?
                </div>
                <div>
                    ?
                </div>
            </main>
        </body>
    </html>")
}

#[launch]
fn rocket() -> _ {
    rocket::build().mount("/", routes![index])
}
