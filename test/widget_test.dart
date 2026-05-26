import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hobby_app/main.dart';

void main() {
  testWidgets('app shell renders bottom navigation bar', (tester) async {
    await tester.pumpWidget(const ProviderScope(child: HobbyApp()));
    await tester.pumpAndSettle();

    expect(find.byType(NavigationBar), findsOneWidget);
    expect(find.text('Library'), findsOneWidget);
    expect(find.text('Quotes'), findsOneWidget);
    expect(find.text('Profile'), findsOneWidget);
  });
}
