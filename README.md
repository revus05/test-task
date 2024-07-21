## Установка

```bash
$ npm install
```

После чего создайте `.env` файл в корне проекта. В нем создайте 2 переменные:

```dotenv
DATABASE_URL=postgresql://[Имя_пользователя]:[Пароль]@localhost/[Название_БД]
SECRET=[Секретное_значение]  #например, ZfHCZNndu$BjjkHdifi(*Fh^Fg
```

```bash
$ npx prisma migrate dev  # необходимо наличие postgresql на устройстве
```

## Запуск

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Развернутая в облаке версия

В облаке уже развернута версия этого проекта. К нему можно обращаться по адресу: `93.177.124.199:3000`

Пример запроса: `http://93.177.124.199:3000/posts` - Получаем результат:

```json
{
    "status": "ok",
    "message": "Successfully got all posts",
    "data": [
        {
            "id": 1,
            "title": "First post",
            "content": "Some big text",
            "userId": 8,
            "createdAt": "2024-07-21T17:53:00.125Z",
            "updatedAt": "2024-07-21T17:53:00.125Z"
        },
        {
            "id": 2,
            "title": "Second post",
            "content": "Some big text",
            "userId": 8,
            "createdAt": "2024-07-21T17:53:09.813Z",
            "updatedAt": "2024-07-21T17:53:09.813Z"
        }
    ]
}
```

Значит, все работает!

## Автор - Скринник Максим

### Контакты:<br>
Email: skrini0505@gmail.com<br>
Телефон: +375 (29) 167-36-51<br>
GitHub: https://github.com/revus05 <br>
LinkedIn: https://www.linkedin.com/in/max-skryn/ <br>
Телеграм: <a href="https://t.me/Max_Screen">@Max_Screen</a>