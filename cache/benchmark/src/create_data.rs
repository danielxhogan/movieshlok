const API_BASE_URL: &str = "http://localhost:3030";
const JWT_TOKEN: &str = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiM2ZmMjU5NTEtODAwNS00MWFhLThjMWMtNDk1Y2JhYzQ4NzA4IiwiZXhwIjoxNjkyOTg4NDUwfQ.JUnMqpJFhbE_-x1Aqin_ASyzeoLJ0ZI_dkUNd_fKa3k";
const USERNAME: &str = "danielxhogan";
const LOREM_IPSUM: &str = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin faucibus convallis lacus eget consectetur. Nullam varius urna vel purus scelerisque faucibus quis id mauris. Ut tempus erat vitae egestas accumsan. Donec convallis odio at quam fringilla, ac aliquet sem rutrum. Sed tempor porttitor leo sit amet commodo. Fusce feugiat, neque non molestie tincidunt, justo ligula egestas erat, sit amet varius ante tortor nec tellus. Sed elementum gravida orci sit amet scelerisque. Quisque euismod nulla enim, sit amet volutpat nulla egestas ut. Pellentesque consectetur est ac leo egestas finibus eget quis magna. Sed sollicitudin dignissim orci. Nam ex nisl, dictum id purus eu, semper mollis eros. Praesent molestie imperdiet erat, vel viverra elit porta mattis. Nunc laoreet tempus sapien, in cursus nisi fringilla vitae. Etiam lorem urna, pulvinar eget bibendum ac, suscipit ut ipsum. Donec at convallis ligula, eget scelerisque risus. Nulla facilisi.

Donec sollicitudin, neque facilisis laoreet porta, libero purus placerat mi, eu laoreet elit nisl quis nunc. Quisque at euismod magna. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Suspendisse vitae ullamcorper mauris. Etiam ultricies urna at ipsum ornare fermentum. Donec ac enim ac dolor luctus placerat. Nunc ultrices gravida nisl, ullamcorper scelerisque mauris accumsan porttitor. Etiam mauris turpis, volutpat quis blandit non, suscipit non odio.

Proin et neque eget ligula dignissim feugiat. Maecenas id ipsum consequat, egestas metus quis, rhoncus mi. Integer tristique turpis lorem, et rhoncus urna maximus at. In commodo lacus sed euismod laoreet. Praesent ut nisi eget massa hendrerit luctus vel ac mi. Sed vestibulum neque mi, ut pharetra dolor pellentesque vel. Nulla congue congue massa et efficitur. Vestibulum non molestie elit. Fusce eu vehicula enim. Phasellus venenatis sapien eu diam mattis, in lobortis ipsum efficitur. Nullam dolor magna, vehicula porttitor nisl a, egestas posuere nunc. Morbi velit nisl, blandit vel porttitor non, malesuada a lacus. Donec laoreet ante vel sodales vulputate. Lorem ipsum dolor sit amet, consectetur adipiscing elit.

Curabitur pharetra, tortor non tempus cursus, ipsum tortor porttitor lacus, sit amet rutrum nibh risus et nulla. Duis vehicula libero ac est efficitur, nec mattis felis porttitor. Integer mollis leo quis ullamcorper aliquam. Proin vitae rhoncus orci, sed tempor leo. Etiam velit velit, fermentum in faucibus et, ullamcorper quis ex. Phasellus tellus ex, egestas eu urna a, tincidunt bibendum turpis. Ut at nulla augue. Cras id dictum eros. Vestibulum quis finibus turpis, ac convallis sapien. Sed sodales aliquam libero lacinia condimentum. Curabitur mollis eu magna nec molestie. Ut quis tempus turpis. Sed ex nulla, bibendum et consectetur eu, pharetra nec nulla.

Praesent facilisis venenatis consequat. Nam auctor tempor nisi, at auctor turpis aliquam sodales. Aliquam rhoncus mauris id felis porta venenatis. Sed lacinia eu elit ut condimentum. Sed pulvinar ipsum lectus, nec eleifend dolor ultrices vel. Nam non velit sed quam malesuada imperdiet. Fusce maximus elementum nisl non consequat. Donec hendrerit condimentum massa in lacinia. Nam at iaculis dolor. Nunc et rhoncus turpis. Sed sed leo in nunc auctor varius et id sapien. Etiam semper nunc eget tempus pulvinar. Nullam non urna vel libero eleifend sollicitudin.";

pub async fn create_review(movie_id: &str, rating: i32, liked: bool) {
    let params = [
        ("jwt_token", JWT_TOKEN.clone()),
        ("username", USERNAME.clone()),
        ("movie_id", movie_id.clone()),
        ("movie_title", movie_id.clone()),
        ("poster_path", movie_id),
        ("review", LOREM_IPSUM.clone()),
        ("rating", &rating.to_string()),
        ("liked", &liked.to_string()),
    ];

    let client = reqwest::Client::new();
    let _ = client
        .post(format!("{API_BASE_URL}/post-review"))
        .form(&params)
        .send()
        .await;
}

pub async fn create_comment(review_id: &str) {
    let params = [
        ("jwt_token", JWT_TOKEN.clone()),
        ("review_id", review_id),
        ("comment", LOREM_IPSUM.clone()),
    ];

    let client = reqwest::Client::new();
    let _ = client
        .post(format!("{API_BASE_URL}/post-comment"))
        .form(&params)
        .send()
        .await;
}

pub async fn create_list(name: &str) {
    let params = [
        ("jwt_token", JWT_TOKEN.clone()),
        ("username", USERNAME.clone()),
        ("name", name),
    ];

    let client = reqwest::Client::new();
    let _ = client
        .post(format!("{API_BASE_URL}/create-list"))
        .form(&params)
        .send()
        .await;
}

pub async fn create_list_item(list_id: &str, movie_id: &str) {
    let params = [
        ("jwt_token", JWT_TOKEN.clone()),
        ("list_id", list_id),
        ("movie_id", movie_id),
        ("movie_title", movie_id),
        ("poster_path", movie_id),
        ("watchlist", "false"),
    ];

    let client = reqwest::Client::new();
    let _ = client
        .post(format!("{API_BASE_URL}/create-list-item"))
        .form(&params)
        .send()
        .await;
}

pub async fn create_watchlist_item(movie_id: &str) {
    let params = [
        ("jwt_token", JWT_TOKEN.clone()),
        ("movie_id", movie_id),
        ("movie_title", movie_id),
        ("poster_path", movie_id),
        ("watchlist", "true"),
    ];

    let client = reqwest::Client::new();
    let _ = client
        .post(format!("{API_BASE_URL}/create-list-item"))
        .form(&params)
        .send()
        .await;
}