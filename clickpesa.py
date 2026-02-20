<<<<<<< HEAD
import requests

url = "https://api.clickpesa.com/third-parties/payments/preview-ussd-push-request"

payload = {
    "amount": "<string>",
    "currency": "TZS",
    "orderReference": "<string>",
    "phoneNumber": "<string>",
    "fetchSenderDetails": False,
    "checksum": "<string>"
}
headers = {
    "Authorization": "Bearer <token>",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.text)
=======
import requests

url = "https://api.clickpesa.com/third-parties/payments/preview-ussd-push-request"

payload = {
    "amount": "<string>",
    "currency": "TZS",
    "orderReference": "<string>",
    "phoneNumber": "<string>",
    "fetchSenderDetails": False,
    "checksum": "<string>"
}
headers = {
    "Authorization": "Bearer <token>",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.text)
>>>>>>> 008b481a07bef776493850239814742c7ebc6d3c
