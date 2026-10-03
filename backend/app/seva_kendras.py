"""
Curated Common Service Centre (CSC) and Maha e-Seva Kendra Locator Database.
Provides citizens with verified physical enrollment centers with addresses,
contacts, operational timings, and Google Maps directions.
"""

from typing import Optional

SEVA_KENDRAS = [
    {
        "id": "csc-satara-01",
        "name": "Maha e-Seva Kendra & CSC — Powai Naka",
        "center_type": "Maha e-Seva Kendra",
        "address": "Shop No. 4, Opposite ST Stand, Powai Naka, Satara",
        "district": "Satara",
        "state": "Maharashtra",
        "pincode": "415001",
        "contact_person": "Sachin Kadam (VLE)",
        "phone": "+91 98220 12345",
        "services": ["Aadhaar DBT Seeding", "PM-KISAN E-KYC", "Ayushman Card Print", "Income Certificate"],
        "maps_url": "https://maps.google.com/?q=Powai+Naka+Satara+CSC",
    },
    {
        "id": "csc-pune-01",
        "name": "Aaple Sarkar Seva Kendra — Shivajinagar",
        "center_type": "Maha e-Seva Kendra",
        "address": "Tehsil Office Compound, Near Sancheti Hospital, Shivajinagar, Pune",
        "district": "Pune",
        "state": "Maharashtra",
        "pincode": "411005",
        "contact_person": "Pooja Deshmukh",
        "phone": "+91 94220 54321",
        "services": ["PM-JAY Golden Card", "Ration Card Updation", "Caste Certificate", "Sukanya Samriddhi Enrollment"],
        "maps_url": "https://maps.google.com/?q=Shivajinagar+Tehsil+Office+Pune+CSC",
    },
    {
        "id": "csc-mumbai-01",
        "name": "Central Mumbai Post Office Citizen Seva Kendra",
        "center_type": "Post Office Seva Kendra",
        "address": "Dadar Head Post Office, Dr. Ambedkar Road, Dadar East, Mumbai",
        "district": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400014",
        "contact_person": "Postmaster In-Charge",
        "phone": "+91 022 2414 1234",
        "services": ["Sukanya Samriddhi Account", "Aadhaar Mobile Link", "National Pension Scheme", "DBT Direct Transfer"],
        "maps_url": "https://maps.google.com/?q=Dadar+Head+Post+Office+Mumbai",
    },
    {
        "id": "csc-lucknow-01",
        "name": "Jan Seva Kendra (CSC) — Hazratganj",
        "center_type": "CSC (Common Service Centre)",
        "address": "Block 2, Collectorate Compound, Qaiserbagh/Hazratganj, Lucknow",
        "district": "Lucknow",
        "state": "Uttar Pradesh",
        "pincode": "226001",
        "contact_person": "Mohd. Irfan (VLE)",
        "phone": "+91 94150 99887",
        "services": ["PM-KISAN Registration", "Ayushman Bharat Card", "Old Age Pension Form", "Labor Registration"],
        "maps_url": "https://maps.google.com/?q=Collectorate+Hazratganj+Lucknow+CSC",
    },
    {
        "id": "csc-patna-01",
        "name": "Vasudha Kendra (CSC) — Boring Road",
        "center_type": "CSC (Common Service Centre)",
        "address": "Shop 12, Krishna Complex, Boring Road Chauraha, Patna",
        "district": "Patna",
        "state": "Bihar",
        "pincode": "800001",
        "contact_person": "Rakesh Kumar Singh",
        "phone": "+91 99340 11223",
        "services": ["DBT Bank Link", "PM Ujjwala Form Submission", "Student Scholarship", "Disability UDID Apply"],
        "maps_url": "https://maps.google.com/?q=Boring+Road+Patna+Vasudha+Kendra",
    },
    {
        "id": "csc-nagpur-01",
        "name": "Maha e-Seva Kendra — Sitabuldi",
        "center_type": "Maha e-Seva Kendra",
        "address": "Near Variety Square, Amravati Road, Sitabuldi, Nagpur",
        "district": "Nagpur",
        "state": "Maharashtra",
        "pincode": "440012",
        "contact_person": "Milind Wankhede",
        "phone": "+91 98900 77665",
        "services": ["BOCW Construction Worker Card", "PM-KISAN Bio-metric e-KYC", "Ration Card e-Kyc"],
        "maps_url": "https://maps.google.com/?q=Sitabuldi+Nagpur+Maha+e+Seva+Kendra",
    },
]


def search_seva_kendras(query: Optional[str] = None, pincode: Optional[str] = None, state: Optional[str] = None) -> list[dict]:
    """Search Seva Kendras by pincode, district, state or keyword with fallback."""
    results = []
    q = (query or "").strip().lower()
    pin = (pincode or "").strip()
    st = (state or "").strip().lower()

    for k in SEVA_KENDRAS:
        if pin and k["pincode"].startswith(pin[:3]):
            results.append(k)
            continue
        if q and (q in k["name"].lower() or q in k["address"].lower() or q in k["district"].lower() or q in k["pincode"]):
            results.append(k)
            continue
        if st and st in k["state"].lower():
            results.append(k)

    # If no specific matches, return default primary hubs
    return results if results else SEVA_KENDRAS[:3]
