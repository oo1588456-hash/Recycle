class UserModel {
  UserModel({required this.id, required this.email, this.fullName, required this.role});
  final int id;
  final String email;
  final String? fullName;
  final String role;

  factory UserModel.fromJson(Map<String, dynamic> j) {
    return UserModel(
      id: j['id'] as int,
      email: j['email'] as String,
      fullName: j['full_name'] as String?,
      role: j['role'] as String? ?? 'buyer',
    );
  }
}

class CategoryModel {
  CategoryModel({required this.id, required this.name});
  final int id;
  final String name;
  factory CategoryModel.fromJson(Map<String, dynamic> j) =>
      CategoryModel(id: j['id'] as int, name: j['name'] as String);
}

class ProductModel {
  ProductModel({
    required this.id,
    required this.title,
    required this.finalPrice,
    required this.currency,
    this.location,
    this.aiConditionLabel,
    this.sellerName,
    this.imageUrl,
  });

  final int id;
  final String title;
  final String finalPrice;
  final String currency;
  final String? location;
  final String? aiConditionLabel;
  final String? sellerName;
  final String? imageUrl;

  factory ProductModel.fromJson(Map<String, dynamic> j, {String? mediaBase}) {
    final seller = j['seller'] as Map<String, dynamic>?;
    final images = (j['images'] as List<dynamic>?) ?? const [];
    String? img;
    if (images.isNotEmpty) {
      final first = images.first as Map<String, dynamic>;
      final path = first['image'] as String?;
      if (path != null && mediaBase != null) {
        img = '$mediaBase$path';
      }
    }
    return ProductModel(
      id: j['id'] as int,
      title: j['title'] as String? ?? '',
      finalPrice: '${j['final_price'] ?? j['original_price'] ?? ''}',
      currency: j['currency'] as String? ?? 'PKR',
      location: j['location'] as String?,
      aiConditionLabel: j['ai_condition_label'] as String?,
      sellerName: seller?['full_name'] as String? ?? seller?['username'] as String?,
      imageUrl: img,
    );
  }
}
