// Basic smoke test — app boots with Riverpod scope.
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:recycle_frontend/app.dart';

void main() {
  testWidgets('RecycleApp builds', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: RecycleApp()));
    await tester.pump();
    expect(find.byType(RecycleApp), findsOneWidget);
  });
}
