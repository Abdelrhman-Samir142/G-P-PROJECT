import 'package:dio/dio.dart';
import '../core/network/dio_client.dart';
import '../core/constants/api_constants.dart';

class ClassifyService {
  static final Dio _dio = DioClient.instance;

  /// POST /classify-image/ (multipart)
  static Future<Map<String, dynamic>> classifyImage(String filePath) async {
    try {
      final fileName = filePath.split('/').last;
      print('--- AI DETECTION DEBUG ---');
      print('Sending to URL: ${ApiConstants.classifyImage}');
      print('File path: $filePath');

      final formData = FormData.fromMap({
        'image': await MultipartFile.fromFile(filePath, filename: fileName),
      });

      final response = await _dio.post(
        ApiConstants.classifyImage, // Ensure this ends with '/' if Django requires it
        data: formData,
        options: Options(
          contentType: 'multipart/form-data',
          headers: {
            'Accept': 'application/json',
          },
        ),
      );

      print('Response Status: ${response.statusCode}');
      print('Response Body: ${response.data}'); // response.data is the body in Dio

      if (response.data is Map) {
        return Map<String, dynamic>.from(response.data as Map);
      } else {
        print('AI Detection returned non-map data: ${response.data}');
        return {'category': 'other'};
      }
    } on DioException catch (e) {
      print('--- AI DETECTION DIO ERROR ---');
      print('Status: ${e.response?.statusCode}');
      print('Body: ${e.response?.data}');
      print('Error details: $e');
      throw Exception(parseDioError(e));
    } catch (e) {
      print('--- AI DETECTION UNKNOWN ERROR ---');
      print(e);
      return {'category': 'other'};
    }
  }
}
