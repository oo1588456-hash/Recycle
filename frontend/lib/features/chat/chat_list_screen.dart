import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/dio_client.dart';
import '../auth/auth_state.dart';

final conversationsProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  final dio = ref.watch(dioProvider);
  final r = await dio.get('/chat/conversations/');
  final data = r.data;
  if (data is List) return data.cast<Map<String, dynamic>>();
  return const [];
});

class ChatListScreen extends ConsumerWidget {
  const ChatListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(conversationsProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Messages')),
      body: async.when(
        data: (rows) {
          if (rows.isEmpty) return const Center(child: Text('No conversations yet.'));
          return ListView.builder(
            itemCount: rows.length,
            itemBuilder: (_, i) {
              final row = rows[i];
              final peer = row['peer'] as Map<String, dynamic>;
              return ListTile(
                title: Text(peer['full_name']?.toString() ?? peer['username']?.toString() ?? 'User'),
                subtitle: Text(row['last_message']?.toString() ?? ''),
                trailing: (row['unread_count'] as int? ?? 0) > 0 ? const Icon(Icons.circle, color: Colors.green, size: 12) : null,
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => ChatDetailScreen(
                      peerId: peer['id'] as int,
                      productId: row['product'] as int?,
                      peerLabel: peer['full_name']?.toString() ?? peer['username']?.toString() ?? '',
                    ),
                  ),
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('$e')),
      ),
    );
  }
}

class ChatDetailScreen extends ConsumerStatefulWidget {
  const ChatDetailScreen({super.key, required this.peerId, required this.peerLabel, this.productId});
  final int peerId;
  final String peerLabel;
  final int? productId;

  @override
  ConsumerState<ChatDetailScreen> createState() => _ChatDetailScreenState();
}

class _ChatDetailScreenState extends ConsumerState<ChatDetailScreen> {
  final _ctrl = TextEditingController();
  var _msgs = <Map<String, dynamic>>[];
  var _loading = true;

  Future<void> _load() async {
    final dio = ref.read(dioProvider);
    final r = await dio.get(
      '/chat/messages/',
      queryParameters: {
        'receiver': widget.peerId,
        if (widget.productId != null) 'product': widget.productId,
      },
    );
    final data = r.data;
    final list = (data is Map && data['results'] is List) ? data['results'] as List<dynamic> : data as List<dynamic>;
    setState(() {
      _msgs = list.cast<Map<String, dynamic>>();
      _loading = false;
    });
  }

  @override
  void initState() {
    super.initState();
    Future.microtask(_load);
  }

  int? _senderId(Map<String, dynamic> m) {
    final s = m['sender'];
    if (s is Map<String, dynamic>) return s['id'] as int?;
    if (s is int) return s;
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final uid = ref.watch(authStateProvider).valueOrNull?.id;
    return Scaffold(
      appBar: AppBar(title: Text(widget.peerLabel)),
      body: Column(
        children: [
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : ListView.builder(
                    itemCount: _msgs.length,
                    itemBuilder: (_, i) {
                      final m = _msgs[i];
                      final sid = _senderId(m);
                      final mine = uid != null && sid == uid;
                      return Align(
                        alignment: mine ? Alignment.centerRight : Alignment.centerLeft,
                        child: Container(
                          margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: mine ? Colors.green.shade100 : Colors.grey.shade200,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(m['message']?.toString() ?? ''),
                        ),
                      );
                    },
                  ),
          ),
          Row(
            children: [
              Expanded(child: TextField(controller: _ctrl, decoration: const InputDecoration(hintText: 'Message'))),
              IconButton(
                onPressed: () async {
                  final dio = ref.read(dioProvider);
                  await dio.post('/chat/messages/', data: {
                    'receiver': widget.peerId,
                    'product': widget.productId,
                    'message': _ctrl.text,
                  });
                  _ctrl.clear();
                  await _load();
                },
                icon: const Icon(Icons.send),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
