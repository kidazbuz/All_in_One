{
    "id": 101,
    "user": {
        "id": 1,
        "username": "admin_user",
        "first_name": "Jane",
        "last_name": "Doe"
    },
    "expense_date": "2025-11-18",
    "amount": "25000.00",
    "description": "Monthly rent payment",
    "payment_method": "Bank Transfer",
    "category": {
        "id": 3,
        "category_name": "Bills & Utilities"
    },
    "payee": {
        "id": 15,
        "payee_name": "ABC Property Management",
        "phone_number": "+2557XXXXXXXX",
        "address": {
            "id": 50,
            "region": { // Region is nested inside Address
                "id": 2,
                "name": "Dar es Salaam"
            },
            "district": "Kinondoni",
            "ward": "Mwananyamala",
            "street": "Kijito Nyama",
            "post_code": 14110,
            "street_prominent_name": "Shekilango Rd",
            "house_number": "4B"
        }
    }
}
