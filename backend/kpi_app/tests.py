from unittest.mock import DEFAULT, patch

from django.test import Client, SimpleTestCase

from kpi_app.data.kpi_dto import KPI


class KpiEndpointTest(SimpleTestCase):
	def test_post_kpi_with_empty_body_returns_area_and_kpis(self):
		expected_response = {
			"area": {
				"name": "selection",
				"km2": 4.453492407357216,
			},
			"kpis": [
				{
					"key": "amenities_distribution",
					"label": "Amenities distribution",
					"value": [
						["Food & Drinks", 0.232222934016656],
						["Professional & Business Services", 0.2114029468289558],
						["Shopping", 0.1258808456117873],
						["Personal Services", 0.08712363869314542],
						["Civic & Community", 0.07495195387572069],
						["Healthcare", 0.06822549647661755],
						["Accommodation", 0.0647021140294683],
						["Culture & Entertainment", 0.0438821268417681],
						["Transport & Automotive", 0.03555413196668802],
						["Education", 0.02914798206278027],
						["Sports", 0.026905829596412557],
					],
					"unit": "%",
					"band": "No band set",
					"definition": "This measures the amenities distribution in percentages of the area",
				},
				{
					"key": "commerce_residence_ratio",
					"label": "Commerce-to-residential ratio",
					"value": 0.6919847328244275,
					"unit": "commercial places per residential building",
					"band": "No band set",
					"definition": "This measures the of commercial places in relation to the residential buildings in the area ",
				},
				{
					"key": "health_care_avg_distance",
					"label": "Nearest health services average distance",
					"value": [172.3122701495243],
					"unit": "m",
					"band": "No band set",
					"definition": "The averge distance between residential blocks and their nearesh health service",
				},
				{
					"key": "land_coverage",
					"label": "Area usage & coverage",
					"value": [0.41794755084934304, 0.09612819988231541, 0.002510783170469598],
					"unit": ["% on Buildings", "% on Green zones", "% on Water bodies"],
					"band": "No band set",
					"definition": "This measures how much of an area is beign used by buildings, green zones, and water bodies",
				},
				{
					"key": "street_intersection_density",
					"label": "Street Intersection density",
					"value": 140.7883841823081,
					"unit": "/km2",
					"band": "No band set",
					"definition": "Density of streets' road intersections per km 2",
				},
				{
					"key": "transport_accessibility_coverage",
					"label": "Public transport coverage",
					"value": [0.009866312577062792, 0.061661924381364475, 0.24664586649689593],
					"unit": ["% at 100m", "% at 250m", "% at 500m"],
					"band": "No band set",
					"definition": "This measures the coverage % of transport network access stepped by distance",
				},
			],
			"insights": [],
		}
		kpi_results = [KPI(**kpi) for kpi in expected_response["kpis"]]
		with patch("kpi_app.logic.get_db_connection") as get_db_connection, patch.multiple(
			"kpi_app.logic.repo",
			get_poly_area=DEFAULT,
			amenities_distribution=DEFAULT,
			commerce_residence_ratio=DEFAULT,
			health_care_avg_distance=DEFAULT,
			land_coverage=DEFAULT,
			street_intersection_density=DEFAULT,
			public_transport_coverage=DEFAULT,
		) as repository_mocks:
			get_db_connection.return_value.__enter__.return_value = object()
			repository_mocks["get_poly_area"].return_value = expected_response["area"]["km2"]
			repository_mocks["amenities_distribution"].return_value = kpi_results[0]
			repository_mocks["commerce_residence_ratio"].return_value = kpi_results[1]
			repository_mocks["health_care_avg_distance"].return_value = kpi_results[2]
			repository_mocks["land_coverage"].return_value = kpi_results[3]
			repository_mocks["street_intersection_density"].return_value = kpi_results[4]
			repository_mocks["public_transport_coverage"].return_value = kpi_results[5]
			response = Client().post("/kpi", data="", content_type="application/json")

		self.assertEqual(response.status_code, 200)
		repository_mocks["get_poly_area"].assert_called_once_with(
			get_db_connection.return_value.__enter__.return_value,
			[],
		)
		self.assertEqual(response.json(), expected_response)
