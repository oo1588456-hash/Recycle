import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/dio_client.dart';

final adminUsersProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  final dio = ref.watch(dioProvider);
  final r = await dio.get('/admin/users/');
  final data = r.data;
  if (data is List) return data.cast<Map<String, dynamic>>();
  return const [];
});

class AdminUsersScreen extends ConsumerWidget {
  const AdminUsersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(adminUsersProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Users')),
      body: async.when(
        data: (rows) {
          if (rows.isEmpty) return const Center(child: Text('No users.'));
          return RefreshIndicator(
            onRefresh: () => ref.refresh(adminUsersProvider.future),
            child: ListView.builder(
              itemCount: rows.length,
              itemBuilder: (_, i) {
                final u = rows[i];
                final blocked = u['is_blocked'] == true;
                return ListTile(
                  title: Text(u['email']?.toString() ?? ''),
                  subtitle: Text('${u['role']} · ${u['full_name'] ?? ''}'),
                  trailing: blocked
                      ? TextButton(
                          onPressed: () async {
                            try {
                              await ref.read(dioProvider).patch('/admin/users/${u['id']}/unblock/');
                              ref.invalidate(adminUsersProvider);
                            } on DioException catch (e) {
                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
                              }
                            }
                          },
                          child: const Text('Unblock'),
                        )
                      : TextButton(
                          onPressed: () async {
                            try {
                              await ref.read(dioProvider).patch('/admin/users/${u['id']}/block/');
                              ref.invalidate(adminUsersProvider);
                            } on DioException catch (e) {
                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
                              }
                            }
                          },
                          child: const Text('Block'),
                        ),
                );
              },
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('$e')),
      ),
    );
  }
}
