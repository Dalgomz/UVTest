TABLE_NAME = "place_category_taxonomy"

def create_place_taxonomy_mapper(db_conn):
  category_mapping = {
    # Food & Drinks
    "restaurant": "Food & Drinks",
    "italian_restaurant": "Food & Drinks",
    "pizza_restaurant": "Food & Drinks",
    "sushi_restaurant": "Food & Drinks",
    "cafe": "Food & Drinks",
    "bar": "Food & Drinks",
    "cocktail_bar": "Food & Drinks",
    "bakery": "Food & Drinks",
    "fast_food_restaurant": "Food & Drinks",
    "gelato": "Food & Drinks",

    # Shopping
    "retail": "Shopping",
    "shopping": "Shopping",
    "clothing_store": "Shopping",
    "shoe_store": "Shopping",
    "jewelry_store": "Shopping",
    "grocery_store": "Shopping",
    "supermarket": "Shopping",
    "bookstore": "Shopping",
    "electronics": "Shopping",
    "furniture_store": "Shopping",

    # Personal Services
    "beauty_salon": "Personal Services",
    "hair_salon": "Personal Services",
    "barber": "Personal Services",
    "massage_therapy": "Personal Services",
    "nail_salon": "Personal Services",
    "laundromat": "Personal Services",
    "dry_cleaning": "Personal Services",
    "shoe_repair": "Personal Services",

    # Professional & Business Services
    "professional_services": "Professional & Business Services",
    "lawyer": "Professional & Business Services",
    "accountant": "Professional & Business Services",
    "architectural_designer": "Professional & Business Services",
    "advertising_agency": "Professional & Business Services",
    "real_estate_agent": "Professional & Business Services",
    "marketing_agency": "Professional & Business Services",
    "software_development": "Professional & Business Services",
    "engineering_services": "Professional & Business Services",

    # Healthcare
    "clinic": "Healthcare", 
    "dental_clinic": "Healthcare", 
    "dentist": "Healthcare", 
    "diagnostic_services": "Healthcare",
    "doctors": "Healthcare", 
    "emergency_room": "Healthcare", 
    "health_center": "Healthcare", 
    "hospital": "Healthcare", 
    "medical_center": "Healthcare", 
    "medical_clinic": "Healthcare", 
    "pharmacy": "Healthcare",
    "physical_therapy": "Healthcare",
    "specialist_clinic": "Healthcare", 
    "urgent_care": "Healthcare", 
    "veterinarian": "Healthcare",

    # Education
    "school": "Education",
    "language_school": "Education",
    "college_university": "Education",
    "specialty_school": "Education",
    "high_school": "Education",
    "elementary_school": "Education",
    "preschool": "Education",

    # Culture & Entertainment
    "art_gallery": "Culture & Entertainment",
    "cinema": "Culture & Entertainment",
    "library": "Culture & Entertainment",
    "music_venue": "Culture & Entertainment",
    "cultural_center": "Culture & Entertainment",
    "museum": "Culture & Entertainment",
    "theatre": "Culture & Entertainment",

    # Sports
    "gym": "Sports",
    "yoga_studio": "Sports",
    "pilates_studio": "Sports",
    "swimming_pool": "Sports",
    "stadium_arena": "Sports",
    "martial_arts_club": "Sports",
    "sports_club_and_league": "Sports",
    "playground": "Sports",

    # Accommodation
    "hotel": "Accommodation",
    "hostel": "Accommodation",
    "bed_and_breakfast": "Accommodation",
    "resort": "Accommodation",
    "service_apartments": "Accommodation",
    "holiday_rental_home": "Accommodation",
    "guest_house": "Accommodation",

    # Civic & Community
    "community_services_non_profits": "Civic & Community",
    "community_center": "Civic & Community",
    "embassy": "Civic & Community",
    "central_government_office": "Civic & Community",
    "post_office": "Civic & Community",
    "public_service_and_government": "Civic & Community",
    "police_department": "Civic & Community",

    # Transport & Automotive
    "transportation": "Transport & Automotive",
    "car_rental_agency": "Transport & Automotive",
    "parking": "Transport & Automotive",
    "train_station": "Transport & Automotive",
    "gas_station": "Transport & Automotive",
    "automotive_repair": "Transport & Automotive",
    "bike_rentals": "Transport & Automotive",
    "car_dealer": "Transport & Automotive",
  }

  query = """
    CREATE OR REPLACE TABLE place_category_taxonomy (
      place_category VARCHAR,
      kpi_category VARCHAR
    );
  """ 
  db_conn.execute(query)

  taxonomy_data = list(category_mapping.items())
  db_conn.executemany("INSERT INTO place_category_taxonomy VALUES (?, ?)", taxonomy_data)
