import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import '../../shared/models/models.dart';

class ProductCard extends StatelessWidget {
  const ProductCard({super.key, required this.product, required this.onTap});
  final ProductModel product;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: SizedBox(
                  width: 72,
                  height: 72,
                  child: product.imageUrl != null
                      ? CachedNetworkImage(imageUrl: product.imageUrl!, fit: BoxFit.cover)
                      : Container(color: Colors.grey.shade200, child: const Icon(Icons.image)),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(product.title, style: Theme.of(context).textTheme.titleMedium, maxLines: 2, overflow: TextOverflow.ellipsis),
                    const SizedBox(height: 4),
                    Text('${product.currency} ${product.finalPrice}', style: const TextStyle(fontWeight: FontWeight.w600)),
                    if (product.aiConditionLabel != null)
                      Text('AI: ${product.aiConditionLabel}', style: Theme.of(context).textTheme.bodySmall),
                    if (product.location != null && product.location!.isNotEmpty)
                      Text(product.location!, style: Theme.of(context).textTheme.bodySmall),
                    if (product.sellerName != null)
                      Text('Seller: ${product.sellerName}', style: Theme.of(context).textTheme.bodySmall),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
